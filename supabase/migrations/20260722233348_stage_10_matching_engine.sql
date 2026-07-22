create table public.ticket_match_runs (
 id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
 requested_by uuid not null references public.profiles(id), algorithm_version text not null,
 status text not null default 'completed' check(status in('completed','failed')), candidate_count integer not null default 0,
 created_at timestamptz not null default now()
);
create table public.ticket_match_results (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references public.ticket_match_runs(id) on delete cascade,
 ticket_id uuid not null references public.tickets(id) on delete cascade, specialist_id uuid not null references public.specialist_profiles(id),
 total_score numeric(5,2) not null check(total_score between 0 and 100), skill_score numeric(5,2) not null,
 reputation_score numeric(5,2) not null, availability_score numeric(5,2) not null, price_score numeric(5,2) not null,
 explanation jsonb not null default '{}'::jsonb, rank integer not null check(rank>0), created_at timestamptz not null default now(),
 unique(run_id,specialist_id), unique(run_id,rank)
);
create index match_runs_ticket_idx on public.ticket_match_runs(ticket_id,created_at desc);
create index match_results_ticket_score_idx on public.ticket_match_results(ticket_id,total_score desc);
alter table public.ticket_match_runs enable row level security; alter table public.ticket_match_runs force row level security;
alter table public.ticket_match_results enable row level security; alter table public.ticket_match_results force row level security;
create policy match_runs_company_read on public.ticket_match_runs for select to authenticated using(exists(select 1 from public.tickets t where t.id=ticket_id and (select private.user_is_company_member(t.company_id))));
create policy match_results_company_read on public.ticket_match_results for select to authenticated using(exists(select 1 from public.tickets t where t.id=ticket_id and (select private.user_is_company_member(t.company_id))));
grant select on public.ticket_match_runs,public.ticket_match_results to authenticated;

create or replace function public.generate_ticket_matches(p_ticket_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_ticket public.tickets; v_run uuid;
begin
 select * into v_ticket from public.tickets where id=p_ticket_id;
 if not found or not private.user_is_company_member(v_ticket.company_id) then raise exception 'not_found_or_forbidden'; end if;
 insert into public.ticket_match_runs(ticket_id,requested_by,algorithm_version) values(p_ticket_id,(select auth.uid()),'deterministic-v1') returning id into v_run;
 insert into public.ticket_match_results(run_id,ticket_id,specialist_id,total_score,skill_score,reputation_score,availability_score,price_score,explanation,rank)
 select v_run,p_ticket_id,s.id,least(100,skill_score+reputation_score+availability_score+price_score),skill_score,reputation_score,availability_score,price_score,
 jsonb_build_object('skill',skill_score,'reputation',reputation_score,'availability',availability_score,'price',price_score),
 row_number() over(order by skill_score+reputation_score+availability_score+price_score desc,s.id)
 from public.specialist_profiles s
 cross join lateral (select case when exists(select 1 from public.specialist_skills ss join public.skills sk on sk.id=ss.skill_id join public.ticket_categories tc on tc.id=v_ticket.category_id where ss.specialist_id=s.id and sk.code=tc.code) then 50 else 10 end::numeric skill_score) a
 cross join lateral (select least(20,s.rating_average*4)::numeric reputation_score) b
 cross join lateral (select case s.availability_status when 'available' then 20 when 'busy' then 8 else 0 end::numeric availability_score) c
 cross join lateral (select case when v_ticket.estimated_cost is null then 10 when s.hourly_rate<=v_ticket.estimated_cost then 10 else 3 end::numeric price_score) d
 where s.approval_status='approved' and s.deleted_at is null;
 update public.ticket_match_runs set candidate_count=(select count(*) from public.ticket_match_results where run_id=v_run) where id=v_run;
 return v_run;
end $$;
revoke all on function public.generate_ticket_matches(uuid) from public,anon;
grant execute on function public.generate_ticket_matches(uuid) to authenticated;
