-- The session context needs role assignments, but Stage 1 intentionally did not
-- expose these tables. Keep access owner-scoped and explicit for the Data API.
create or replace function private.user_owns_membership(target_membership_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.company_memberships membership
    where membership.id = target_membership_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.deleted_at is null
  );
$$;

revoke all on function private.user_owns_membership(uuid) from public, anon;
grant execute on function private.user_owns_membership(uuid) to authenticated;

create policy membership_roles_owner_read
on public.membership_roles for select to authenticated
using ((select private.user_owns_membership(membership_id)));

create policy platform_user_roles_self_read
on public.platform_user_roles for select to authenticated
using (user_id = (select auth.uid()) and revoked_at is null and (expires_at is null or expires_at > now()));

grant select on public.membership_roles, public.platform_user_roles to authenticated;
