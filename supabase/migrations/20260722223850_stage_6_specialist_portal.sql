create table public.specialist_availability (
 id uuid primary key default gen_random_uuid(), specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
 weekday smallint not null check(weekday between 0 and 6), starts_at time not null, ends_at time not null,
 time_zone text not null default 'America/Santiago' references public.time_zones(code), modality text not null check(modality in('remote','onsite','hybrid')),
 is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(starts_at<ends_at), unique(specialist_id,weekday,starts_at,ends_at)
);
create table public.specialist_portfolio (
 id uuid primary key default gen_random_uuid(), specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
 title text not null, description text not null, project_url text, is_public boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table public.specialist_bank_accounts (
 id uuid primary key default gen_random_uuid(), specialist_id uuid not null unique references public.specialist_profiles(id) on delete cascade,
 bank_name text not null, account_type text not null, account_number_masked text not null, account_reference_encrypted text not null,
 holder_name text not null, holder_tax_id text not null, verification_status text not null default 'pending' check(verification_status in('pending','verified','rejected')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.specialist_tax_profiles (
 id uuid primary key default gen_random_uuid(), specialist_id uuid not null unique references public.specialist_profiles(id) on delete cascade,
 legal_name text not null, tax_id text not null, taxpayer_type text not null, billing_email text not null,
 validation_status text not null default 'pending' check(validation_status in('pending','verified','rejected')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index specialist_availability_specialist_idx on public.specialist_availability(specialist_id,weekday) where is_active;
create index specialist_portfolio_specialist_idx on public.specialist_portfolio(specialist_id) where deleted_at is null;
create trigger specialist_availability_updated_at before update on public.specialist_availability for each row execute function public.set_updated_at();
create trigger specialist_portfolio_updated_at before update on public.specialist_portfolio for each row execute function public.set_updated_at();
create trigger specialist_bank_accounts_updated_at before update on public.specialist_bank_accounts for each row execute function public.set_updated_at();
create trigger specialist_tax_profiles_updated_at before update on public.specialist_tax_profiles for each row execute function public.set_updated_at();

create policy specialist_profile_own_insert on public.specialist_profiles for insert to authenticated with check(user_id=(select auth.uid()) and approval_status='pending');
create policy specialist_profile_own_update on public.specialist_profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy specialist_skills_own_insert on public.specialist_skills for insert to authenticated with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy specialist_skills_own_update on public.specialist_skills for update to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))) with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy specialist_skills_own_delete on public.specialist_skills for delete to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy specialist_certifications_own_insert on public.specialist_certifications for insert to authenticated with check(status='pending' and exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy specialist_certifications_own_update on public.specialist_certifications for update to authenticated using(status in('pending','rejected') and exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))) with check(status='pending' and exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));

do $$ declare t text; begin foreach t in array array['specialist_availability','specialist_portfolio','specialist_bank_accounts','specialist_tax_profiles'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy availability_approved_or_owner_read on public.specialist_availability for select to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and (s.approval_status='approved' or s.user_id=(select auth.uid()))));
create policy availability_owner_insert on public.specialist_availability for insert to authenticated with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy availability_owner_update on public.specialist_availability for update to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))) with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy availability_owner_delete on public.specialist_availability for delete to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy portfolio_public_or_owner_read on public.specialist_portfolio for select to authenticated using((is_public and exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.approval_status='approved')) or exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy portfolio_owner_insert on public.specialist_portfolio for insert to authenticated with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy portfolio_owner_update on public.specialist_portfolio for update to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))) with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy portfolio_owner_delete on public.specialist_portfolio for delete to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy bank_account_owner_access on public.specialist_bank_accounts for all to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))) with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy tax_profile_owner_access on public.specialist_tax_profiles for all to authenticated using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))) with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));

grant insert,update on public.specialist_profiles to authenticated;
grant insert,update,delete on public.specialist_skills to authenticated;
grant insert,update on public.specialist_certifications to authenticated;
grant select,insert,update,delete on public.specialist_availability,public.specialist_portfolio to authenticated;
grant select,insert,update on public.specialist_bank_accounts,public.specialist_tax_profiles to authenticated;
