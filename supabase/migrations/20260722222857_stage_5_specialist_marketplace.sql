create table public.skills (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, category text not null,
 is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.specialist_profiles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references public.profiles(id), public_name text not null,
 professional_title text not null, bio text not null check(char_length(bio) between 40 and 2000), years_experience integer not null default 0 check(years_experience between 0 and 70),
 hourly_rate numeric(12,2) not null check(hourly_rate>0), currency_code text not null default 'CLP' references public.currencies(code),
 modality text not null default 'remote' check(modality in('remote','onsite','hybrid')), region_id uuid references public.regions(id),
 availability_status text not null default 'unavailable' check(availability_status in('available','busy','unavailable')),
 approval_status text not null default 'pending' check(approval_status in('pending','approved','rejected','suspended')),
 plan_code text not null default 'free' check(plan_code in('free','pro','elite')), avatar_path text,
 rating_average numeric(3,2) not null default 0 check(rating_average between 0 and 5), reviews_count integer not null default 0,
 completed_services integer not null default 0, average_response_minutes integer, sla_compliance_percent numeric(5,2),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table public.specialist_skills (
 specialist_id uuid not null references public.specialist_profiles(id) on delete cascade, skill_id uuid not null references public.skills(id),
 proficiency text not null check(proficiency in('basic','intermediate','advanced','expert')), years_experience integer not null default 0 check(years_experience>=0),
 created_at timestamptz not null default now(), primary key(specialist_id,skill_id)
);
create table public.specialist_certifications (
 id uuid primary key default gen_random_uuid(), specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
 name text not null, issuer text not null, credential_id text, verification_url text, issued_at date, expires_at date,
 status text not null default 'pending' check(status in('pending','under_review','verified','rejected','expired')),
 document_path text, rejection_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.company_favorite_specialists (
 company_id uuid not null references public.companies(id), specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
 created_by uuid not null references public.profiles(id), created_at timestamptz not null default now(), primary key(company_id,specialist_id)
);
create table public.specialist_reviews (
 id uuid primary key default gen_random_uuid(), specialist_id uuid not null references public.specialist_profiles(id), company_id uuid not null references public.companies(id),
 ticket_id uuid not null unique references public.tickets(id), author_id uuid not null references public.profiles(id), rating integer not null check(rating between 1 and 5),
 technical_rating integer check(technical_rating between 1 and 5), communication_rating integer check(communication_rating between 1 and 5),
 comment text check(comment is null or char_length(comment)<=2000), is_public boolean not null default true, created_at timestamptz not null default now()
);
create table public.ticket_invitations (
 id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
 specialist_id uuid not null references public.specialist_profiles(id), invited_by uuid not null references public.profiles(id), message text,
 status text not null default 'pending' check(status in('pending','viewed','interested','rejected','expired','converted')),
 expires_at timestamptz not null default(now()+interval '7 days'), responded_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(ticket_id,specialist_id)
);

create index specialist_profiles_marketplace_idx on public.specialist_profiles(approval_status,availability_status,rating_average desc) where deleted_at is null;
create index specialist_profiles_region_idx on public.specialist_profiles(region_id) where region_id is not null;
create index specialist_skills_skill_idx on public.specialist_skills(skill_id,specialist_id);
create index specialist_certifications_specialist_idx on public.specialist_certifications(specialist_id,status);
create index favorite_specialists_specialist_idx on public.company_favorite_specialists(specialist_id);
create index specialist_reviews_specialist_idx on public.specialist_reviews(specialist_id,created_at desc) where is_public;
create index specialist_reviews_company_idx on public.specialist_reviews(company_id);
create index specialist_reviews_author_idx on public.specialist_reviews(author_id);
create index ticket_invitations_specialist_idx on public.ticket_invitations(specialist_id,status,created_at desc);
create index ticket_invitations_invited_by_idx on public.ticket_invitations(invited_by);

create trigger skills_updated_at before update on public.skills for each row execute function public.set_updated_at();
create trigger specialist_profiles_updated_at before update on public.specialist_profiles for each row execute function public.set_updated_at();
create trigger specialist_certifications_updated_at before update on public.specialist_certifications for each row execute function public.set_updated_at();
create trigger ticket_invitations_updated_at before update on public.ticket_invitations for each row execute function public.set_updated_at();

do $$ declare t text; begin foreach t in array array['skills','specialist_profiles','specialist_skills','specialist_certifications','company_favorite_specialists','specialist_reviews','ticket_invitations'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy skills_read on public.skills for select to authenticated using(is_active);
create policy specialist_marketplace_read on public.specialist_profiles for select to authenticated using(approval_status='approved' and deleted_at is null or user_id=(select auth.uid()));
create policy specialist_skills_read on public.specialist_skills for select to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id));
create policy specialist_certifications_read on public.specialist_certifications for select to authenticated using(status='verified' and exists(select 1 from public.specialist_profiles s where s.id=specialist_id) or exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy favorites_company_read on public.company_favorite_specialists for select to authenticated using((select private.user_is_company_member(company_id)));
create policy favorites_company_insert on public.company_favorite_specialists for insert to authenticated with check(created_by=(select auth.uid()) and (select private.user_is_company_member(company_id)));
create policy favorites_company_delete on public.company_favorite_specialists for delete to authenticated using((select private.user_is_company_member(company_id)));
create policy reviews_public_read on public.specialist_reviews for select to authenticated using(is_public and exists(select 1 from public.specialist_profiles s where s.id=specialist_id));
create policy invitations_participant_read on public.ticket_invitations for select to authenticated using(exists(select 1 from public.tickets t where t.id=ticket_id) or exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy invitations_company_insert on public.ticket_invitations for insert to authenticated with check(invited_by=(select auth.uid()) and exists(select 1 from public.tickets t where t.id=ticket_id));

grant select on public.skills,public.specialist_profiles,public.specialist_skills,public.specialist_certifications,public.specialist_reviews to authenticated;
grant select,insert,delete on public.company_favorite_specialists to authenticated;
grant select,insert on public.ticket_invitations to authenticated;

insert into public.skills(code,name,category) values
('windows_server','Windows Server','Infrastructure'),('linux','Linux','Infrastructure'),('sql_server','SQL Server','Database'),
('postgresql','PostgreSQL','Database'),('oracle','Oracle','Database'),('microsoft_365','Microsoft 365','Productivity'),
('azure','Microsoft Azure','Cloud'),('aws','Amazon Web Services','Cloud'),('gcp','Google Cloud','Cloud'),
('networking','Redes','Infrastructure'),('firewall','Firewalls','Security'),('cybersecurity','Ciberseguridad','Security'),
('devops','DevOps','Engineering'),('ai','Inteligencia Artificial','Engineering');
