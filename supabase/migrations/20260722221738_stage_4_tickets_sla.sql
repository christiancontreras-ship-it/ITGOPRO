create table public.ticket_categories (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
  description text, is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create sequence public.ticket_number_seq;
revoke all on sequence public.ticket_number_seq from public, anon, authenticated;

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  company_id uuid not null references public.companies(id),
  requester_id uuid not null references public.profiles(id),
  category_id uuid not null references public.ticket_categories(id),
  title text not null check (char_length(title) between 5 and 160),
  description text not null check (char_length(description) between 10 and 10000),
  priority text not null check (priority in ('low','medium','high','critical')),
  status text not null default 'new' check (status in ('new','published','ai_evaluation','waiting_specialist','assigned','in_progress','waiting_customer','resolved','closed','cancelled','disputed')),
  modality text not null check (modality in ('remote','onsite','hybrid')),
  region_id uuid references public.regions(id),
  estimated_cost numeric(14,2) check (estimated_cost is null or estimated_cost >= 0),
  final_cost numeric(14,2) check (final_cost is null or final_cost >= 0),
  response_due_at timestamptz not null default now(),
  resolution_due_at timestamptz not null default now(),
  first_responded_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);

create table public.ticket_status_history (
  id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
  from_status text, to_status text not null, changed_by uuid references public.profiles(id),
  reason text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create table public.ticket_comments (
  id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id), body text not null check (char_length(body) between 1 and 5000),
  visibility text not null default 'customer' check (visibility in ('customer','internal')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);

create table public.ticket_files (
  id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id), storage_path text not null unique,
  original_name text not null, mime_type text not null, size_bytes bigint not null check (size_bytes between 1 and 10485760),
  status text not null default 'pending' check (status in ('pending','available','quarantined','deleted')),
  created_at timestamptz not null default now(), deleted_at timestamptz
);

create or replace function private.prepare_ticket() returns trigger language plpgsql security definer set search_path='' as $$
declare response_interval interval; resolution_interval interval;
begin
  if new.code is null or new.code = '' then new.code := 'ITG-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.ticket_number_seq')::text,6,'0'); end if;
  response_interval := case new.priority when 'critical' then interval '30 minutes' when 'high' then interval '2 hours' when 'medium' then interval '4 hours' else interval '8 hours' end;
  resolution_interval := case new.priority when 'critical' then interval '4 hours' when 'high' then interval '8 hours' when 'medium' then interval '24 hours' else interval '72 hours' end;
  new.response_due_at := now() + response_interval;
  new.resolution_due_at := now() + resolution_interval;
  new.requester_id := (select auth.uid());
  return new;
end $$;

create or replace function private.record_ticket_status() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' or old.status is distinct from new.status then
    insert into public.ticket_status_history(ticket_id,from_status,to_status,changed_by)
    values(new.id,case when tg_op='UPDATE' then old.status else null end,new.status,(select auth.uid()));
  end if;
  return new;
end $$;

create trigger tickets_prepare before insert on public.tickets for each row execute function private.prepare_ticket();
create trigger tickets_status_history after insert or update of status on public.tickets for each row execute function private.record_ticket_status();
create trigger tickets_updated_at before update on public.tickets for each row execute function public.set_updated_at();
create trigger ticket_categories_updated_at before update on public.ticket_categories for each row execute function public.set_updated_at();
create trigger ticket_comments_updated_at before update on public.ticket_comments for each row execute function public.set_updated_at();

create index tickets_company_status_created_idx on public.tickets(company_id,status,created_at desc) where deleted_at is null;
create index tickets_requester_idx on public.tickets(requester_id,created_at desc);
create index tickets_category_idx on public.tickets(category_id);
create index tickets_region_idx on public.tickets(region_id) where region_id is not null;
create index tickets_resolution_due_idx on public.tickets(resolution_due_at) where status not in ('resolved','closed','cancelled');
create index ticket_status_history_ticket_idx on public.ticket_status_history(ticket_id,created_at desc);
create index ticket_status_history_changed_by_idx on public.ticket_status_history(changed_by) where changed_by is not null;
create index ticket_comments_ticket_idx on public.ticket_comments(ticket_id,created_at);
create index ticket_comments_author_idx on public.ticket_comments(author_id);
create index ticket_files_ticket_idx on public.ticket_files(ticket_id,created_at);
create index ticket_files_uploaded_by_idx on public.ticket_files(uploaded_by);

alter table public.ticket_categories enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_status_history enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.ticket_files enable row level security;
alter table public.ticket_categories force row level security;
alter table public.tickets force row level security;
alter table public.ticket_status_history force row level security;
alter table public.ticket_comments force row level security;
alter table public.ticket_files force row level security;

create policy ticket_categories_read on public.ticket_categories for select to authenticated using (is_active);
create policy tickets_company_read on public.tickets for select to authenticated using ((select private.user_is_company_member(company_id)));
create policy tickets_company_insert on public.tickets for insert to authenticated with check ((select private.user_is_company_member(company_id)) and requester_id=(select auth.uid()));
create policy tickets_company_update on public.tickets for update to authenticated using ((select private.user_is_company_member(company_id))) with check ((select private.user_is_company_member(company_id)));
create policy ticket_history_company_read on public.ticket_status_history for select to authenticated using (exists(select 1 from public.tickets t where t.id=ticket_id));
create policy ticket_comments_company_read on public.ticket_comments for select to authenticated using (exists(select 1 from public.tickets t where t.id=ticket_id));
create policy ticket_comments_company_insert on public.ticket_comments for insert to authenticated with check (author_id=(select auth.uid()) and exists(select 1 from public.tickets t where t.id=ticket_id));
create policy ticket_files_company_read on public.ticket_files for select to authenticated using (exists(select 1 from public.tickets t where t.id=ticket_id));
create policy ticket_files_company_insert on public.ticket_files for insert to authenticated with check (uploaded_by=(select auth.uid()) and exists(select 1 from public.tickets t where t.id=ticket_id));

grant select on public.ticket_categories,public.ticket_status_history to authenticated;
grant select,insert,update on public.tickets to authenticated;
grant select,insert on public.ticket_comments,public.ticket_files to authenticated;

insert into public.ticket_categories(code,name,sort_order) values
('user_support','Soporte usuario',10),('microsoft_365','Microsoft 365',20),('windows_server','Windows Server',30),
('linux','Linux',40),('sql_server','SQL Server',50),('postgresql','PostgreSQL',60),('networking','Redes',70),
('firewall','Firewall',80),('azure','Azure',90),('aws','AWS',100),('cybersecurity','Ciberseguridad',110),
('backup','Backup',120),('erp','ERP',130),('devops','DevOps',140),('artificial_intelligence','Inteligencia Artificial',150);
