create table public.partner_profiles (
 id uuid primary key default gen_random_uuid(), company_id uuid not null unique references public.companies(id),
 status text not null default 'pending' check(status in('pending','approved','suspended','rejected')), commission_percent numeric(5,2) not null default 15 check(commission_percent between 0 and 100),
 approved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.partner_specialists (
 partner_id uuid not null references public.partner_profiles(id) on delete cascade, specialist_id uuid not null references public.specialist_profiles(id),
 status text not null default 'active' check(status in('active','suspended','removed')), added_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(partner_id,specialist_id)
);
create table public.partner_clients (
 partner_id uuid not null references public.partner_profiles(id) on delete cascade, client_company_id uuid not null references public.companies(id),
 status text not null default 'active' check(status in('active','paused','ended')), starts_at date not null default current_date, ends_at date,
 created_by uuid not null references public.profiles(id), created_at timestamptz not null default now(), primary key(partner_id,client_company_id)
);
create index partner_specialists_specialist_idx on public.partner_specialists(specialist_id,status);
create index partner_clients_company_idx on public.partner_clients(client_company_id,status);
create trigger partner_profiles_updated_at before update on public.partner_profiles for each row execute function public.set_updated_at();
create trigger partner_specialists_updated_at before update on public.partner_specialists for each row execute function public.set_updated_at();
do $$ declare t text; begin foreach t in array array['partner_profiles','partner_specialists','partner_clients'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy partner_profiles_member_read on public.partner_profiles for select to authenticated using((select private.user_is_company_member(company_id)));
create policy partner_specialists_member_read on public.partner_specialists for select to authenticated using(exists(select 1 from public.partner_profiles p where p.id=partner_id));
create policy partner_clients_member_read on public.partner_clients for select to authenticated using(exists(select 1 from public.partner_profiles p where p.id=partner_id));
grant select on public.partner_profiles,public.partner_specialists,public.partner_clients to authenticated;
