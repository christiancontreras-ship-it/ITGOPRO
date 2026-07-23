-- Stage 17: production readiness primitives. Deployments remain controlled by CI,
-- while these records provide an auditable operational control plane.
create table public.platform_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null unique check (version ~ '^\d+\.\d+\.\d+$'),
  commit_sha text not null check (length(commit_sha) between 7 and 64),
  status text not null default 'planned' check (status in ('planned','testing','ready','deployed','rolled_back','archived')),
  notes text,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[A-Z][A-Z0-9_]+$'),
  description text not null,
  enabled boolean not null default false,
  rollout_percentage smallint not null default 0 check (rollout_percentage between 0 and 100),
  environment text not null default 'production' check (environment in ('development','test','staging','production')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deployment_history (
  id uuid primary key default gen_random_uuid(),
  release_id uuid references public.platform_releases(id) on delete restrict,
  environment text not null check (environment in ('development','test','staging','production')),
  status text not null check (status in ('started','succeeded','failed','rolled_back')),
  provider_deployment_id text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.operational_runbooks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  severity text not null check (severity in ('sev1','sev2','sev3','sev4')),
  owner_role text not null,
  document_path text not null,
  enabled boolean not null default true,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deployment_history_environment_started_idx on public.deployment_history(environment, started_at desc);
create index feature_flags_environment_enabled_idx on public.feature_flags(environment, enabled);

create trigger platform_releases_updated_at before update on public.platform_releases for each row execute function public.set_updated_at();
create trigger feature_flags_updated_at before update on public.feature_flags for each row execute function public.set_updated_at();
create trigger operational_runbooks_updated_at before update on public.operational_runbooks for each row execute function public.set_updated_at();

alter table public.platform_releases enable row level security;
alter table public.platform_releases force row level security;
alter table public.feature_flags enable row level security;
alter table public.feature_flags force row level security;
alter table public.deployment_history enable row level security;
alter table public.deployment_history force row level security;
alter table public.operational_runbooks enable row level security;
alter table public.operational_runbooks force row level security;

create policy authenticated_release_read on public.platform_releases for select to authenticated using (true);
create policy authenticated_flag_read on public.feature_flags for select to authenticated using (true);
create policy authenticated_runbook_read on public.operational_runbooks for select to authenticated using (enabled);

revoke all on public.platform_releases, public.feature_flags, public.deployment_history, public.operational_runbooks from anon;
grant select on public.platform_releases, public.feature_flags, public.operational_runbooks to authenticated;

insert into public.feature_flags(key, description, enabled, rollout_percentage, environment) values
  ('AI_ENABLED','Análisis asistido de tickets',true,100,'production'),
  ('AUTO_MATCHING','Matching automático sin aprobación humana',false,0,'production'),
  ('MANAGED_SERVICES','Servicios gestionados',true,100,'production'),
  ('PARTNER_PORTAL','Portal de partners',true,100,'production'),
  ('ADVANCED_ANALYTICS','Analítica avanzada',true,100,'production');

insert into public.operational_runbooks(code,title,severity,owner_role,document_path) values
  ('DB-OUTAGE','Indisponibilidad de base de datos','sev1','incident_commander','docs/operations/runbooks/database-outage.md'),
  ('ROLLBACK','Rollback de aplicación','sev2','release_manager','docs/operations/runbooks/rollback.md'),
  ('AI-OUTAGE','Degradación del proveedor de IA','sev3','operations','docs/operations/runbooks/ai-outage.md');
