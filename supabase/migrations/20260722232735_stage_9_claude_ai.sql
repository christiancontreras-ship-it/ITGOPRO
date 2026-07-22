create table public.ticket_ai_analyses (
 id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
 requested_by uuid not null references public.profiles(id), provider text not null default 'anthropic', model text not null,
 prompt_version text not null, category_code text, suggested_priority text check(suggested_priority is null or suggested_priority in('low','medium','high','critical')),
 complexity text check(complexity is null or complexity in('low','medium','high','expert')),
 estimated_hours numeric(8,2) check(estimated_hours is null or estimated_hours>0), estimated_cost numeric(14,2) check(estimated_cost is null or estimated_cost>=0),
 technical_summary text not null, recommended_actions jsonb not null default '[]'::jsonb, risk_flags jsonb not null default '[]'::jsonb,
 input_tokens integer check(input_tokens is null or input_tokens>=0), output_tokens integer check(output_tokens is null or output_tokens>=0),
 status text not null default 'completed' check(status in('completed','failed')), created_at timestamptz not null default now()
);
create index ticket_ai_analyses_ticket_created_idx on public.ticket_ai_analyses(ticket_id,created_at desc);
alter table public.ticket_ai_analyses enable row level security;
alter table public.ticket_ai_analyses force row level security;
create policy ticket_ai_analysis_participant_read on public.ticket_ai_analyses for select to authenticated using(exists(select 1 from public.tickets t where t.id=ticket_id));
create policy ticket_ai_analysis_company_insert on public.ticket_ai_analyses for insert to authenticated with check(requested_by=(select auth.uid()) and exists(select 1 from public.tickets t where t.id=ticket_id and (select private.user_is_company_member(t.company_id))));
grant select,insert on public.ticket_ai_analyses to authenticated;
