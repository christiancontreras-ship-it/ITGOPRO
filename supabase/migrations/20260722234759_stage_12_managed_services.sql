create table public.managed_service_catalog (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, description text not null,
 monthly_price numeric(14,2) not null check(monthly_price>=0), currency_code text not null default 'CLP' references public.currencies(code),
 default_sla_hours integer not null check(default_sla_hours>0), is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.managed_services (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), catalog_id uuid not null references public.managed_service_catalog(id),
 specialist_id uuid references public.specialist_profiles(id), status text not null default 'pending' check(status in('pending','active','paused','cancelled','expired')),
 starts_at date not null, ends_at date, monthly_amount numeric(14,2) not null check(monthly_amount>=0), sla_hours integer not null check(sla_hours>0),
 auto_renew boolean not null default false, created_by uuid not null references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.managed_service_assets (
 id uuid primary key default gen_random_uuid(), managed_service_id uuid not null references public.managed_services(id) on delete cascade,
 name text not null, asset_type text not null, external_reference text, status text not null default 'active' check(status in('active','maintenance','retired')),
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.managed_service_checklists (
 id uuid primary key default gen_random_uuid(), managed_service_id uuid not null references public.managed_services(id) on delete cascade,
 period_start date not null, period_end date not null, status text not null default 'pending' check(status in('pending','in_progress','completed','overdue')),
 items jsonb not null default '[]'::jsonb, completed_by uuid references public.profiles(id), completed_at timestamptz, created_at timestamptz not null default now(), check(period_end>=period_start)
);
create index managed_services_company_idx on public.managed_services(company_id,status);
create index managed_services_specialist_idx on public.managed_services(specialist_id,status) where specialist_id is not null;
create trigger managed_service_catalog_updated_at before update on public.managed_service_catalog for each row execute function public.set_updated_at();
create trigger managed_services_updated_at before update on public.managed_services for each row execute function public.set_updated_at();
create trigger managed_service_assets_updated_at before update on public.managed_service_assets for each row execute function public.set_updated_at();
do $$ declare t text; begin foreach t in array array['managed_service_catalog','managed_services','managed_service_assets','managed_service_checklists'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy managed_catalog_read on public.managed_service_catalog for select to authenticated using(is_active);
create policy managed_services_participant_read on public.managed_services for select to authenticated using((select private.user_is_company_member(company_id)) or exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy managed_assets_participant_read on public.managed_service_assets for select to authenticated using(exists(select 1 from public.managed_services ms where ms.id=managed_service_id));
create policy managed_checklists_participant_read on public.managed_service_checklists for select to authenticated using(exists(select 1 from public.managed_services ms where ms.id=managed_service_id));
grant select on public.managed_service_catalog,public.managed_services,public.managed_service_assets,public.managed_service_checklists to authenticated;
insert into public.managed_service_catalog(code,name,description,monthly_price,default_sla_hours) values
('windows_server','Windows Server administrado','Parches, capacidad, seguridad y continuidad.',90000,8),('linux','Linux administrado','Operación preventiva y soporte de servidores Linux.',90000,8),('sql_server','SQL Server administrado','Backups, capacidad y rendimiento de SQL Server.',120000,6),('postgresql','PostgreSQL administrado','Operación, respaldo y optimización PostgreSQL.',120000,6),('firewall','Firewall administrado','Políticas, revisión y continuidad de perímetro.',70000,6),('microsoft_365','Microsoft 365 administrado','Administración de tenant, usuarios y seguridad.',50000,8),('cybersecurity','Ciberseguridad administrada','Hardening y gestión continua de vulnerabilidades.',180000,4);
