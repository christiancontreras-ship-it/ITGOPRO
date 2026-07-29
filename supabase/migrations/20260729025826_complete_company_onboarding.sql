-- Complete the foundational onboarding when a user creates their first company.
create or replace function public.create_company_with_owner(
  legal_name text,
  trade_name text default null,
  tax_id text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  company_uuid uuid;
  membership_uuid uuid;
  owner_role uuid;
begin
  if uid is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select id
  into owner_role
  from public.roles
  where code = 'company_owner'
    and scope_type = 'company'
    and is_active;

  if owner_role is null then
    raise exception 'company_owner role missing';
  end if;

  insert into public.companies (
    legal_name,
    trade_name,
    tax_id,
    tax_id_normalized,
    created_by,
    status,
    onboarding_status
  )
  values (
    trim(legal_name),
    nullif(trim(trade_name), ''),
    tax_id,
    public.normalize_tax_id(tax_id),
    uid,
    'active',
    'completed'
  )
  returning id into company_uuid;

  insert into public.company_settings (company_id)
  values (company_uuid);

  insert into public.company_memberships (
    company_id,
    user_id,
    status,
    is_primary,
    joined_at
  )
  values (company_uuid, uid, 'active', true, now())
  returning id into membership_uuid;

  insert into public.membership_roles (membership_id, role_id, assigned_by)
  values (membership_uuid, owner_role, uid);

  update public.profiles
  set onboarding_status = 'completed'
  where id = uid;

  insert into public.audit_events (
    event_type,
    actor_user_id,
    actor_membership_id,
    company_id,
    entity_type,
    entity_id,
    action,
    outcome,
    source,
    metadata
  )
  values (
    'company.created',
    uid,
    membership_uuid,
    company_uuid,
    'company',
    company_uuid,
    'create',
    'success',
    'database',
    jsonb_build_object('onboarding_status', 'completed')
  );

  return company_uuid;
end
$$;

revoke all on function public.create_company_with_owner(text, text, text)
from public, anon;

grant execute on function public.create_company_with_owner(text, text, text)
to authenticated;
