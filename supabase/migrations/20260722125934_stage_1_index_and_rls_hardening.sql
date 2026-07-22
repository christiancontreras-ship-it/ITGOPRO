-- Etapa 1: índices de claves foráneas y evaluación eficiente de RLS.
create index audit_events_actor_membership_id_idx on public.audit_events(actor_membership_id) where actor_membership_id is not null;
create index audit_events_company_id_created_at_idx on public.audit_events(company_id,created_at desc) where company_id is not null;
create index companies_company_size_id_idx on public.companies(company_size_id) where company_size_id is not null;
create index companies_created_by_idx on public.companies(created_by) where created_by is not null;
create index companies_default_currency_code_idx on public.companies(default_currency_code);
create index companies_default_language_code_idx on public.companies(default_language_code);
create index companies_default_time_zone_idx on public.companies(default_time_zone);
create index companies_industry_id_idx on public.companies(industry_id) where industry_id is not null;
create index company_addresses_commune_id_idx on public.company_addresses(commune_id) where commune_id is not null;
create index company_addresses_company_id_idx on public.company_addresses(company_id) where deleted_at is null;
create index company_addresses_country_code_idx on public.company_addresses(country_code);
create index company_addresses_region_id_idx on public.company_addresses(region_id) where region_id is not null;
create index company_contacts_company_id_idx on public.company_contacts(company_id) where deleted_at is null;
create index company_domains_company_id_idx on public.company_domains(company_id) where deleted_at is null;
create index company_invitations_accepted_by_idx on public.company_invitations(accepted_by) where accepted_by is not null;
create index company_invitations_intended_role_id_idx on public.company_invitations(intended_role_id) where intended_role_id is not null;
create index company_invitations_invited_by_idx on public.company_invitations(invited_by);
create index company_memberships_invited_by_idx on public.company_memberships(invited_by) where invited_by is not null;
create index company_settings_currency_idx on public.company_settings(default_currency_code);
create index company_settings_language_idx on public.company_settings(default_language_code);
create index company_settings_time_zone_idx on public.company_settings(default_time_zone);
create index company_type_assignments_company_type_id_idx on public.company_type_assignments(company_type_id);
create index membership_roles_assigned_by_idx on public.membership_roles(assigned_by) where assigned_by is not null;
create index membership_roles_role_id_idx on public.membership_roles(role_id);
create index platform_user_roles_assigned_by_idx on public.platform_user_roles(assigned_by) where assigned_by is not null;
create index platform_user_roles_role_id_idx on public.platform_user_roles(role_id);
create index profiles_locale_idx on public.profiles(locale);
create index role_permissions_permission_id_idx on public.role_permissions(permission_id);
create index profiles_time_zone_idx on public.profiles(time_zone);
create index user_preferences_locale_idx on public.user_preferences(locale);
create index user_preferences_time_zone_idx on public.user_preferences(time_zone);

drop policy companies_member_read on public.companies;
drop policy companies_authorized_update on public.companies;
drop policy memberships_self_or_authorized_read on public.company_memberships;
drop policy contacts_member_read on public.company_contacts;
drop policy addresses_member_read on public.company_addresses;
drop policy settings_member_read on public.company_settings;
drop policy domains_member_read on public.company_domains;
drop policy invitations_authorized_read on public.company_invitations;

create policy companies_member_read on public.companies for select to authenticated using ((select private.user_is_company_member(id)));
create policy companies_authorized_update on public.companies for update to authenticated
  using ((select private.user_has_permission(id,'company.update')))
  with check ((select private.user_has_permission(id,'company.update')));
create policy memberships_self_or_authorized_read on public.company_memberships for select to authenticated
  using (user_id=(select auth.uid()) or (select private.user_has_permission(company_id,'company.members.read')));
create policy contacts_member_read on public.company_contacts for select to authenticated using ((select private.user_is_company_member(company_id)));
create policy addresses_member_read on public.company_addresses for select to authenticated using ((select private.user_is_company_member(company_id)));
create policy settings_member_read on public.company_settings for select to authenticated using ((select private.user_is_company_member(company_id)));
create policy domains_member_read on public.company_domains for select to authenticated using ((select private.user_is_company_member(company_id)));
create policy invitations_authorized_read on public.company_invitations for select to authenticated using ((select private.user_has_permission(company_id,'company.members.invite')));
