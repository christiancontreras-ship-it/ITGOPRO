begin;

insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'owner-a@synthetic.test', '{}'::jsonb, '{"display_name":"Owner A"}'::jsonb, now(), now()),
  ('00000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'member-b@synthetic.test', '{}'::jsonb, '{"display_name":"Member B"}'::jsonb, now(), now());

do $$
begin
  if (select count(*) from public.profiles where id in (
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002'
  )) <> 2 then
    raise exception 'handle_new_auth_user did not create profiles';
  end if;
end;
$$;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-4000-8000-000000000001';
select public.create_company_with_owner('Empresa A Sintética', 'Empresa A', '76.123.456-K');

do $$
begin
  if (select count(*) from public.companies where legal_name = 'Empresa A Sintética') <> 1 then
    raise exception 'owner cannot read own company';
  end if;
end;
$$;

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-4000-8000-000000000002';

do $$
begin
  if (select count(*) from public.companies where legal_name = 'Empresa A Sintética') <> 0 then
    raise exception 'cross-company read was not blocked';
  end if;
  if has_table_privilege('authenticated', 'public.audit_events', 'UPDATE') then
    raise exception 'authenticated role can update audit events';
  end if;
end;
$$;

reset role;
insert into public.company_memberships (company_id, user_id, status, joined_at)
select id, '00000000-0000-4000-8000-000000000002', 'active', now()
from public.companies where legal_name = 'Empresa A Sintética';

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-4000-8000-000000000002';
do $$
begin
  if (select count(*) from public.companies where legal_name = 'Empresa A Sintética') <> 1 then
    raise exception 'active member cannot read company';
  end if;
end;
$$;

reset role;
update public.company_memberships
set status = 'suspended', suspended_at = now()
where user_id = '00000000-0000-4000-8000-000000000002';

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-4000-8000-000000000002';
do $$
begin
  if (select count(*) from public.companies where legal_name = 'Empresa A Sintética') <> 0 then
    raise exception 'suspended member retained access';
  end if;
end;
$$;

rollback;
