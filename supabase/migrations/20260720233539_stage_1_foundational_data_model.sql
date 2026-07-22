-- ITGO Etapa 1: modelo fundacional multiempresa y RBAC.
create table public.countries (
  code text primary key check (code ~ '^[A-Z]{2}$'),
  name text not null unique,
  is_active boolean not null default true
);
create table public.currencies (
  code text primary key check (code ~ '^[A-Z]{3}$'),
  name text not null,
  symbol text not null,
  is_active boolean not null default true
);
create table public.languages (
  code text primary key check (code ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  name text not null,
  is_active boolean not null default true
);
create table public.time_zones (
  code text primary key,
  name text not null,
  is_active boolean not null default true
);
create table public.regions (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries(code),
  code text not null,
  name text not null,
  unique (country_code, code)
);
create table public.communes (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions(id),
  code text,
  name text not null,
  unique (region_id, name)
);
create table public.industries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true
);
create table public.company_sizes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  min_employees integer check (min_employees is null or min_employees >= 0),
  max_employees integer check (max_employees is null or max_employees >= min_employees),
  is_active boolean not null default true
);
create table public.company_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (first_name is null or length(trim(first_name)) between 1 and 100),
  last_name text check (last_name is null or length(trim(last_name)) between 1 and 100),
  display_name text check (display_name is null or length(trim(display_name)) between 1 and 160),
  phone text,
  avatar_path text,
  locale text not null default 'es-CL' references public.languages(code),
  time_zone text not null default 'America/Santiago' references public.time_zones(code),
  onboarding_status text not null default 'not_started' check (onboarding_status in ('not_started','in_progress','completed')),
  profile_status text not null default 'pending' check (profile_status in ('pending','active','suspended','disabled')),
  last_active_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null check (length(trim(legal_name)) between 2 and 200),
  trade_name text,
  tax_id text,
  tax_id_normalized text,
  industry_id uuid references public.industries(id),
  company_size_id uuid references public.company_sizes(id),
  country_code text not null default 'CL' references public.countries(code),
  default_currency_code text not null default 'CLP' references public.currencies(code),
  default_language_code text not null default 'es-CL' references public.languages(code),
  default_time_zone text not null default 'America/Santiago' references public.time_zones(code),
  website_url text,
  phone text,
  email text,
  status text not null default 'draft' check (status in ('draft','active','suspended','disabled')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected')),
  onboarding_status text not null default 'not_started' check (onboarding_status in ('not_started','in_progress','completed')),
  logo_path text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index companies_country_tax_id_uidx on public.companies(country_code, tax_id_normalized) where tax_id_normalized is not null and deleted_at is null;

create table public.company_type_assignments (
  company_id uuid not null references public.companies(id) on delete cascade,
  company_type_id uuid not null references public.company_types(id),
  created_at timestamptz not null default now(),
  primary key (company_id, company_type_id)
);
create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  user_id uuid not null references public.profiles(id),
  status text not null default 'invited' check (status in ('invited','pending','active','suspended','revoked')),
  job_title text,
  department text,
  is_primary boolean not null default false,
  joined_at timestamptz,
  suspended_at timestamptz,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index company_memberships_active_uidx on public.company_memberships(company_id,user_id) where deleted_at is null and status in ('invited','pending','active','suspended');
create unique index company_memberships_primary_uidx on public.company_memberships(user_id) where is_primary and status = 'active' and deleted_at is null;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  scope_type text not null check (scope_type in ('platform','company','partner','specialist')),
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  resource text not null,
  action text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(role_id, permission_id)
);
create table public.membership_roles (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.company_memberships(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index membership_roles_active_uidx on public.membership_roles(membership_id,role_id) where revoked_at is null;
create table public.platform_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  role_id uuid not null references public.roles(id),
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);
create unique index platform_user_roles_active_uidx on public.platform_user_roles(user_id,role_id) where revoked_at is null;

create table public.company_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  email text not null,
  email_normalized text not null,
  invited_by uuid not null references public.profiles(id),
  intended_role_id uuid references public.roles(id),
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','expired','revoked')),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index company_invitations_active_uidx on public.company_invitations(company_id,email_normalized) where status='pending';
create table public.company_contacts (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id),
  contact_type text not null check (contact_type in ('legal','commercial','operational','financial','technical','security','privacy')),
  name text not null, email text, phone text, position text, is_primary boolean not null default false,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table public.company_addresses (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id),
  address_type text not null, country_code text not null references public.countries(code), region_id uuid references public.regions(id), commune_id uuid references public.communes(id),
  city text, street_line_1 text not null, street_line_2 text, postal_code text, latitude numeric(9,6), longitude numeric(9,6), is_primary boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table public.company_settings (
  id uuid primary key default gen_random_uuid(), company_id uuid not null unique references public.companies(id) on delete cascade,
  default_language_code text not null default 'es-CL' references public.languages(code), default_currency_code text not null default 'CLP' references public.currencies(code),
  default_time_zone text not null default 'America/Santiago' references public.time_zones(code), date_format text not null default 'DD-MM-YYYY', time_format text not null default '24h',
  first_day_of_week smallint not null default 1 check(first_day_of_week between 0 and 6), notification_preferences jsonb not null default '{}'::jsonb,
  feature_preferences jsonb not null default '{}'::jsonb, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.company_domains (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), domain text not null, domain_normalized text not null,
  verification_status text not null default 'pending' check(verification_status in ('pending','verified','failed','revoked')),
  verification_token_hash text, verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create unique index company_domains_normalized_uidx on public.company_domains(domain_normalized) where deleted_at is null;
create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade, locale text not null default 'es-CL' references public.languages(code),
  time_zone text not null default 'America/Santiago' references public.time_zones(code), theme text not null default 'system' check(theme in ('system','light','dark')),
  date_format text not null default 'DD-MM-YYYY', time_format text not null default '24h', notification_preferences jsonb not null default '{}'::jsonb,
  accessibility_preferences jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.audit_events add column actor_membership_id uuid references public.company_memberships(id) on delete set null;
alter table public.audit_events add column company_id uuid references public.companies(id) on delete set null;
alter table public.audit_events add column action text;
alter table public.audit_events add column outcome text check(outcome is null or outcome in ('success','failure','denied'));
alter table public.audit_events add column source text;
alter table public.audit_events add column request_id text;
alter table public.audit_events add column ip_address_masked inet;
alter table public.audit_events add column user_agent_summary text;
alter table public.audit_events add column before_data jsonb;
alter table public.audit_events add column after_data jsonb;

create or replace function public.normalize_email(value text) returns text language sql immutable strict security invoker set search_path='' as $$ select lower(trim(value)) $$;
create or replace function public.normalize_domain(value text) returns text language sql immutable strict security invoker set search_path='' as $$ select lower(trim(trailing '.' from trim(value))) $$;
create or replace function public.normalize_tax_id(value text) returns text language sql immutable strict security invoker set search_path='' as $$ select upper(regexp_replace(value, '[^0-9Kk]', '', 'g')) $$;

create or replace function public.handle_new_auth_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,first_name,last_name,display_name,profile_status)
  values(new.id, nullif(trim(new.raw_user_meta_data->>'first_name'),''), nullif(trim(new.raw_user_meta_data->>'last_name'),''), nullif(trim(new.raw_user_meta_data->>'display_name'),''), 'active')
  on conflict(id) do nothing;
  insert into public.user_preferences(user_id) values(new.id) on conflict(user_id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_auth_user() from public,anon,authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

create schema if not exists private;
revoke all on schema private from public,anon,authenticated;

create or replace function private.user_is_company_member(target_company_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.company_memberships m where m.company_id=target_company_id and m.user_id=(select auth.uid()) and m.status='active' and m.deleted_at is null)
$$;
create or replace function private.user_has_permission(target_company_id uuid, permission_code text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.company_memberships m join public.membership_roles mr on mr.membership_id=m.id join public.role_permissions rp on rp.role_id=mr.role_id join public.permissions p on p.id=rp.permission_id
 where m.company_id=target_company_id and m.user_id=(select auth.uid()) and m.status='active' and m.deleted_at is null and mr.revoked_at is null and (mr.expires_at is null or mr.expires_at>now()) and p.code=permission_code and p.is_active)
$$;
revoke all on function private.user_is_company_member(uuid) from public,anon;
revoke all on function private.user_has_permission(uuid,text) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.user_is_company_member(uuid), private.user_has_permission(uuid,text) to authenticated;

create or replace function public.create_company_with_owner(legal_name text, trade_name text default null, tax_id text default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid(); company_uuid uuid; membership_uuid uuid; owner_role uuid;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  select id into owner_role from public.roles where code='company_owner' and scope_type='company' and is_active;
  if owner_role is null then raise exception 'company_owner role missing'; end if;
  insert into public.companies(legal_name,trade_name,tax_id,tax_id_normalized,created_by,status) values(trim(legal_name),nullif(trim(trade_name),''),tax_id,public.normalize_tax_id(tax_id),uid,'active') returning id into company_uuid;
  insert into public.company_settings(company_id) values(company_uuid);
  insert into public.company_memberships(company_id,user_id,status,is_primary,joined_at) values(company_uuid,uid,'active',true,now()) returning id into membership_uuid;
  insert into public.membership_roles(membership_id,role_id,assigned_by) values(membership_uuid,owner_role,uid);
  insert into public.audit_events(event_type,actor_user_id,actor_membership_id,company_id,entity_type,entity_id,action,outcome,source) values('company.created',uid,membership_uuid,company_uuid,'company',company_uuid,'create','success','database');
  return company_uuid;
end $$;
revoke all on function public.create_company_with_owner(text,text,text) from public,anon;
grant execute on function public.create_company_with_owner(text,text,text) to authenticated;

-- RLS: deny by default, then add narrowly scoped policies.
do $$ declare t text; begin foreach t in array array['profiles','companies','company_type_assignments','company_memberships','roles','permissions','role_permissions','membership_roles','platform_user_roles','company_invitations','company_contacts','company_addresses','company_settings','company_domains','user_preferences','countries','currencies','languages','time_zones','regions','communes','industries','company_sizes','company_types'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy profiles_select_self on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_update_self on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy preferences_self on public.user_preferences for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy companies_member_read on public.companies for select to authenticated using (private.user_is_company_member(id));
create policy companies_authorized_update on public.companies for update to authenticated using (private.user_has_permission(id,'company.update')) with check (private.user_has_permission(id,'company.update'));
create policy memberships_self_or_authorized_read on public.company_memberships for select to authenticated using (user_id=(select auth.uid()) or private.user_has_permission(company_id,'company.members.read'));
create policy contacts_member_read on public.company_contacts for select to authenticated using(private.user_is_company_member(company_id));
create policy addresses_member_read on public.company_addresses for select to authenticated using(private.user_is_company_member(company_id));
create policy settings_member_read on public.company_settings for select to authenticated using(private.user_is_company_member(company_id));
create policy domains_member_read on public.company_domains for select to authenticated using(private.user_is_company_member(company_id));
create policy invitations_authorized_read on public.company_invitations for select to authenticated using(private.user_has_permission(company_id,'company.members.invite'));
create policy reference_authenticated_read on public.countries for select to authenticated using(true);
create policy currencies_authenticated_read on public.currencies for select to authenticated using(true);
create policy languages_authenticated_read on public.languages for select to authenticated using(true);
create policy timezones_authenticated_read on public.time_zones for select to authenticated using(true);
create policy regions_authenticated_read on public.regions for select to authenticated using(true);
create policy communes_authenticated_read on public.communes for select to authenticated using(true);
create policy industries_authenticated_read on public.industries for select to authenticated using(true);
create policy sizes_authenticated_read on public.company_sizes for select to authenticated using(true);
create policy company_types_authenticated_read on public.company_types for select to authenticated using(true);
create policy roles_authenticated_read on public.roles for select to authenticated using(true);
create policy permissions_authenticated_read on public.permissions for select to authenticated using(true);

-- Explicit Data API grants are required by current Supabase defaults.
grant select on public.countries,public.currencies,public.languages,public.time_zones,public.regions,public.communes,public.industries,public.company_sizes,public.company_types,public.roles,public.permissions to authenticated;
grant select,update on public.profiles,public.companies,public.user_preferences to authenticated;
grant select on public.company_memberships,public.company_contacts,public.company_addresses,public.company_settings,public.company_domains,public.company_invitations to authenticated;
revoke all on public.audit_events from anon,authenticated;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger memberships_updated_at before update on public.company_memberships for each row execute function public.set_updated_at();
create trigger roles_updated_at before update on public.roles for each row execute function public.set_updated_at();
create trigger permissions_updated_at before update on public.permissions for each row execute function public.set_updated_at();
create trigger invitations_updated_at before update on public.company_invitations for each row execute function public.set_updated_at();
create trigger contacts_updated_at before update on public.company_contacts for each row execute function public.set_updated_at();
create trigger addresses_updated_at before update on public.company_addresses for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.company_settings for each row execute function public.set_updated_at();
create trigger domains_updated_at before update on public.company_domains for each row execute function public.set_updated_at();
create trigger preferences_updated_at before update on public.user_preferences for each row execute function public.set_updated_at();

insert into public.countries(code,name) values('CL','Chile') on conflict do nothing;
insert into public.currencies(code,name,symbol) values('CLP','Peso chileno','$') on conflict do nothing;
insert into public.languages(code,name) values('es-CL','Español (Chile)') on conflict do nothing;
insert into public.time_zones(code,name) values('America/Santiago','Santiago de Chile') on conflict do nothing;
insert into public.company_types(code,name) values ('customer','Cliente'),('service_provider','Proveedor de servicios'),('partner','Partner'),('internal','Interna'),('prospect','Prospecto') on conflict do nothing;
insert into public.company_sizes(code,name,min_employees,max_employees) values ('micro','Microempresa',1,9),('small','Pequeña',10,49),('medium','Mediana',50,199),('large','Grande',200,null) on conflict do nothing;
insert into public.roles(code,name,scope_type,is_system) values
('platform_super_admin','Superadministrador','platform',true),('platform_admin','Administrador de plataforma','platform',true),('company_owner','Propietario de empresa','company',true),('company_admin','Administrador de empresa','company',true),('company_manager','Gestor de empresa','company',true),('company_member','Miembro de empresa','company',true),('company_finance','Finanzas de empresa','company',true),('company_auditor','Auditor de empresa','company',true),('specialist','Especialista','specialist',true),('partner_owner','Propietario de partner','partner',true),('partner_admin','Administrador de partner','partner',true),('support_agent','Agente de soporte','platform',true),('read_only','Solo lectura','company',true) on conflict do nothing;
insert into public.permissions(code,resource,action,description) values
('company.read','company','read','Leer empresa'),('company.update','company','update','Actualizar empresa'),('company.members.read','company.members','read','Leer miembros'),('company.members.invite','company.members','invite','Invitar miembros'),('company.members.manage','company.members','manage','Gestionar miembros'),('company.roles.read','company.roles','read','Leer roles'),('company.roles.assign','company.roles','assign','Asignar roles'),('company.settings.read','company.settings','read','Leer configuración'),('company.settings.update','company.settings','update','Actualizar configuración'),('audit.read','audit','read','Leer auditoría'),('profile.read.self','profile','read.self','Leer perfil propio'),('profile.update.self','profile','update.self','Actualizar perfil propio'),('platform.companies.read','platform.companies','read','Leer empresas globalmente'),('platform.companies.manage','platform.companies','manage','Gestionar empresas globalmente') on conflict do nothing;
insert into public.role_permissions(role_id,permission_id) select r.id,p.id from public.roles r cross join public.permissions p where r.code in ('company_owner','company_admin') and p.code like 'company.%' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id) select r.id,p.id from public.roles r cross join public.permissions p where r.code='company_owner' and p.code='audit.read' on conflict do nothing;
