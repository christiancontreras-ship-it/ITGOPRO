-- Persist the onboarding intent. This value controls navigation only;
-- authorization continues to rely on memberships, roles and RLS.
alter table public.profiles
  add column account_type text
  check (account_type is null or account_type in ('company', 'specialist'));

comment on column public.profiles.account_type is
  'Self-selected onboarding path. Not an authorization role.';

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_account_type text;
begin
  selected_account_type := case
    when new.raw_user_meta_data->>'account_type' in ('company', 'specialist')
      then new.raw_user_meta_data->>'account_type'
    else null
  end;

  insert into public.profiles(
    id,
    first_name,
    last_name,
    display_name,
    profile_status,
    account_type
  )
  values(
    new.id,
    nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'last_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    'active',
    selected_account_type
  )
  on conflict(id) do nothing;

  insert into public.user_preferences(user_id)
  values(new.id)
  on conflict(user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
