alter table public.tickets
  add column if not exists resolution_summary text
  check (
    resolution_summary is null
    or char_length(resolution_summary) between 20 and 5000
  );

create or replace function public.resolve_ticket_work(
  p_ticket_id uuid,
  p_resolution_summary text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets;
  v_assignment public.ticket_assignments;
  v_summary text := trim(p_resolution_summary);
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required';
  end if;

  if char_length(v_summary) not between 20 and 5000 then
    raise exception 'invalid_resolution_summary';
  end if;

  select *
  into v_ticket
  from public.tickets
  where id = p_ticket_id
  for update;

  if not found or v_ticket.status not in ('in_progress', 'waiting_customer') then
    raise exception 'ticket_not_resolvable';
  end if;

  select ta.*
  into v_assignment
  from public.ticket_assignments ta
  join public.specialist_profiles sp on sp.id = ta.specialist_id
  where ta.ticket_id = p_ticket_id
    and ta.status = 'started'
    and sp.user_id = (select auth.uid())
  for update of ta;

  if not found then
    raise exception 'not_found_or_forbidden';
  end if;

  update public.ticket_assignments
  set status = 'completed',
      completed_at = now()
  where id = v_assignment.id;

  update public.tickets
  set status = 'resolved',
      resolved_at = now(),
      resolution_summary = v_summary,
      final_cost = (
        select amount
        from public.ticket_applications
        where id = v_assignment.application_id
      )
  where id = p_ticket_id;

  insert into public.ticket_messages (
    ticket_id,
    sender_id,
    body,
    visibility
  )
  values (
    p_ticket_id,
    (select auth.uid()),
    'Resolución informada: ' || v_summary,
    'participants'
  );

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
    'ticket.resolved',
    (select auth.uid()),
    v_ticket.company_id,
    'ticket',
    p_ticket_id,
    'resolve',
    'success',
    jsonb_build_object('assignment_id', v_assignment.id)
  );
end;
$$;

create or replace function public.close_resolved_ticket(p_ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required';
  end if;

  select *
  into v_ticket
  from public.tickets
  where id = p_ticket_id
  for update;

  if not found
    or not private.user_is_company_member(v_ticket.company_id)
  then
    raise exception 'not_found_or_forbidden';
  end if;

  if v_ticket.status <> 'resolved' then
    raise exception 'ticket_not_closable';
  end if;

  update public.tickets
  set status = 'closed',
      closed_at = now()
  where id = p_ticket_id;

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
    'ticket.closed',
    (select auth.uid()),
    v_ticket.company_id,
    'ticket',
    p_ticket_id,
    'close',
    'success',
    '{}'::jsonb
  );
end;
$$;

revoke all on function public.resolve_ticket_work(uuid, text)
from public, anon;
revoke all on function public.close_resolved_ticket(uuid)
from public, anon;

grant execute on function public.resolve_ticket_work(uuid, text)
to authenticated;
grant execute on function public.close_resolved_ticket(uuid)
to authenticated;
