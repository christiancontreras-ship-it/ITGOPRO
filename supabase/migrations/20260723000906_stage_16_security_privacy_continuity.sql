create table public.security_risks (
 id uuid primary key default gen_random_uuid(), company_id uuid references public.companies(id), code text not null, title text not null, description text not null,
 category text not null, probability smallint not null check(probability between 1 and 5), impact smallint not null check(impact between 1 and 5),
 inherent_score integer generated always as (probability*impact) stored, residual_score integer check(residual_score between 1 and 25),
 treatment text not null check(treatment in('avoid','reduce','transfer','accept')), status text not null default 'open' check(status in('open','treating','accepted','closed')),
 owner_id uuid references public.profiles(id), review_due_at date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(company_id,code)
);
create table public.security_controls (
 id uuid primary key default gen_random_uuid(), code text not null unique, title text not null, objective text not null,
 control_type text not null check(control_type in('preventive','detective','corrective','compensating')), implementation_status text not null default 'planned' check(implementation_status in('planned','partial','implemented','not_applicable')),
 evidence_reference text, last_tested_at timestamptz, next_test_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.security_incidents (
 id uuid primary key default gen_random_uuid(), company_id uuid references public.companies(id), title text not null, description text not null,
 severity text not null check(severity in('sev1','sev2','sev3','sev4')), status text not null default 'reported' check(status in('reported','triaged','investigating','contained','recovering','resolved','closed')),
 personal_data_involved boolean not null default false, commander_id uuid references public.profiles(id), detected_at timestamptz not null,
 contained_at timestamptz, resolved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.privacy_processing_activities (
 id uuid primary key default gen_random_uuid(), company_id uuid references public.companies(id), name text not null, purpose text not null,
 lawful_basis text not null, data_categories text[] not null, subject_categories text[] not null, retention_period text not null,
 processors text[] not null default '{}', status text not null default 'active' check(status in('draft','active','retired')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.privacy_subject_requests (
 id uuid primary key default gen_random_uuid(), requester_user_id uuid references public.profiles(id), request_type text not null check(request_type in('access','rectification','deletion','opposition','blocking','consent_withdrawal')),
 status text not null default 'submitted' check(status in('submitted','identity_verification','under_review','in_progress','approved','partially_approved','denied','completed','cancelled')),
 identity_verified_at timestamptz, due_at timestamptz not null, decision_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.continuity_plans (
 id uuid primary key default gen_random_uuid(), company_id uuid references public.companies(id), process_name text not null,
 criticality text not null check(criticality in('low','medium','high','critical')), rto_minutes integer not null check(rto_minutes>0), rpo_minutes integer not null check(rpo_minutes>=0),
 strategy text not null, status text not null default 'draft' check(status in('draft','approved','tested','retired')), last_tested_at timestamptz, next_test_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.continuity_restore_tests (
 id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.continuity_plans(id), tested_at timestamptz not null,
 achieved_rto_minutes integer, achieved_rpo_minutes integer, result text not null check(result in('passed','partial','failed')), evidence_reference text,
 tested_by uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
do $$ declare t text; begin foreach t in array array['security_risks','security_controls','security_incidents','privacy_processing_activities','privacy_subject_requests','continuity_plans','continuity_restore_tests'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy risks_company_read on public.security_risks for select to authenticated using(company_id is null or (select private.user_is_company_member(company_id)));
create policy controls_authenticated_read on public.security_controls for select to authenticated using(true);
create policy incidents_company_read on public.security_incidents for select to authenticated using(company_id is null or (select private.user_is_company_member(company_id)));
create policy processing_company_read on public.privacy_processing_activities for select to authenticated using(company_id is null or (select private.user_is_company_member(company_id)));
create policy subject_requests_own_read on public.privacy_subject_requests for select to authenticated using(requester_user_id=(select auth.uid()));
create policy subject_requests_own_insert on public.privacy_subject_requests for insert to authenticated with check(requester_user_id=(select auth.uid()));
create policy continuity_company_read on public.continuity_plans for select to authenticated using(company_id is null or (select private.user_is_company_member(company_id)));
create policy restore_tests_company_read on public.continuity_restore_tests for select to authenticated using(exists(select 1 from public.continuity_plans p where p.id=plan_id));
grant select on public.security_risks,public.security_controls,public.security_incidents,public.privacy_processing_activities,public.continuity_plans,public.continuity_restore_tests to authenticated;
grant select,insert on public.privacy_subject_requests to authenticated;
do $$ declare t text; begin foreach t in array array['security_risks','security_controls','security_incidents','privacy_processing_activities','privacy_subject_requests','continuity_plans'] loop execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()',t,t); end loop; end $$;
insert into public.security_controls(code,title,objective,control_type,implementation_status) values
('IAM-01','RLS multiempresa','Impedir acceso horizontal entre empresas.','preventive','implemented'),
('IAM-02','MFA privilegiado','Reducir compromiso de cuentas de alto privilegio.','preventive','partial'),
('APP-01','Validación estricta','Validar entradas de APIs y acciones de servidor.','preventive','implemented'),
('APP-02','Headers de seguridad','Aplicar CSP, HSTS y políticas de navegador.','preventive','implemented'),
('OPS-01','Restauración probada','Validar periódicamente backups y RTO/RPO.','corrective','planned'),
('PRV-01','Derechos del titular','Registrar y tramitar solicitudes verificadas.','corrective','partial');
