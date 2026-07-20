-- ITGO Etapa 0: fundamentos internos de plataforma.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Actualiza updated_at en tablas que adopten este trigger genérico.';

revoke all on function public.set_updated_at() from public, anon, authenticated;

create table public.platform_settings (
  key text primary key check (length(trim(key)) between 1 and 120),
  value jsonb not null default '{}'::jsonb,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.platform_settings is
  'Configuración técnica mínima de plataforma; no contiene configuración funcional de etapas futuras.';

create trigger platform_settings_set_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (length(trim(event_type)) between 1 and 160),
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint audit_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

comment on table public.audit_events is
  'Registro inmutable de eventos técnicos y de seguridad, escrito exclusivamente por procesos de servidor autorizados.';
comment on column public.audit_events.metadata is
  'Metadatos estructurados sin secretos, credenciales ni contenido sensible.';

create index audit_events_event_type_created_at_idx
  on public.audit_events (event_type, created_at desc);
create index audit_events_actor_user_id_created_at_idx
  on public.audit_events (actor_user_id, created_at desc)
  where actor_user_id is not null;

alter table public.platform_settings enable row level security;
alter table public.platform_settings force row level security;
alter table public.audit_events enable row level security;
alter table public.audit_events force row level security;

revoke all on table public.platform_settings from anon, authenticated;
revoke all on table public.audit_events from anon, authenticated;

-- No se crean políticas en Etapa 0: los clientes no tienen acceso directo.
