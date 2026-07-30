create or replace function public.submit_ticket_review(
  p_ticket_id uuid,
  p_rating integer,
  p_technical_rating integer,
  p_communication_rating integer,
  p_comment text default null,
  p_is_public boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets;
  v_assignment public.ticket_assignments;
  v_review_id uuid;
  v_comment text := nullif(trim(p_comment), '');
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required';
  end if;

  if p_rating not between 1 and 5
    or p_technical_rating not between 1 and 5
    or p_communication_rating not between 1 and 5
    or char_length(coalesce(v_comment, '')) > 2000
  then
    raise exception 'invalid_review';
  end if;

  select *
  into v_ticket
  from public.tickets
  where id = p_ticket_id
  for update;

  if not found
    or v_ticket.status <> 'closed'
    or not private.user_is_company_member(v_ticket.company_id)
  then
    raise exception 'not_found_or_forbidden';
  end if;

  select *
  into v_assignment
  from public.ticket_assignments
  where ticket_id = p_ticket_id
    and status = 'completed'
  order by completed_at desc nulls last
  limit 1;

  if not found then
    raise exception 'completed_assignment_required';
  end if;

  insert into public.specialist_reviews (
    specialist_id,
    company_id,
    ticket_id,
    author_id,
    rating,
    technical_rating,
    communication_rating,
    comment,
    is_public
  )
  values (
    v_assignment.specialist_id,
    v_ticket.company_id,
    p_ticket_id,
    (select auth.uid()),
    p_rating,
    p_technical_rating,
    p_communication_rating,
    v_comment,
    p_is_public
  )
  returning id into v_review_id;

  update public.specialist_profiles sp
  set rating_average = review_stats.rating_average,
      reviews_count = review_stats.reviews_count,
      completed_services = greatest(
        sp.completed_services,
        (
          select count(*)::integer
          from public.ticket_assignments ta
          where ta.specialist_id = sp.id
            and ta.status = 'completed'
        )
      )
  from (
    select
      specialist_id,
      round(avg(rating)::numeric, 2) as rating_average,
      count(*)::integer as reviews_count
    from public.specialist_reviews
    where specialist_id = v_assignment.specialist_id
    group by specialist_id
  ) review_stats
  where sp.id = review_stats.specialist_id;

  insert into public.audit_events (
    event_type,
    actor_user_id,
    company_id,
    entity_type,
    entity_id,
    action,
    outcome,
    metadata
  )
  values (
    'ticket.review_submitted',
    (select auth.uid()),
    v_ticket.company_id,
    'specialist_review',
    v_review_id,
    'create',
    'success',
    jsonb_build_object(
      'ticket_id', p_ticket_id,
      'specialist_id', v_assignment.specialist_id,
      'rating', p_rating
    )
  );

  return v_review_id;
exception
  when unique_violation then
    raise exception 'ticket_already_reviewed';
end;
$$;

revoke all on function public.submit_ticket_review(
  uuid,
  integer,
  integer,
  integer,
  text,
  boolean
)
from public, anon;

grant execute on function public.submit_ticket_review(
  uuid,
  integer,
  integer,
  integer,
  text,
  boolean
)
to authenticated;
