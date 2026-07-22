begin;

insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values
('60000000-0000-0000-0000-000000000001','portal-specialist@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('60000000-0000-0000-0000-000000000002','portal-outsider@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');

set local role authenticated;
set local request.jwt.claims='{"sub":"60000000-0000-0000-0000-000000000001","role":"authenticated"}';

insert into public.specialist_profiles(user_id,public_name,professional_title,bio,hourly_rate)
values(auth.uid(),'Especialista Portal','Administrador Linux','Perfil sintético para validar el aislamiento del portal privado.',45000)
returning id as specialist_id \gset

insert into public.specialist_bank_accounts(specialist_id,bank_name,account_type,account_number_masked,account_reference_encrypted,holder_name,holder_tax_id)
values(:'specialist_id','Banco sintético','checking','1234','vault://synthetic/account','Especialista Portal','1-9');

do $$ begin
  if (select count(*) from public.specialist_bank_accounts) <> 1 then
    raise exception 'specialist cannot read own bank account';
  end if;
end $$;

set local request.jwt.claims='{"sub":"60000000-0000-0000-0000-000000000002","role":"authenticated"}';

do $$ begin
  if (select count(*) from public.specialist_bank_accounts) <> 0 then
    raise exception 'private bank account leaked to another user';
  end if;
  if (select count(*) from public.specialist_profiles) <> 0 then
    raise exception 'pending specialist profile leaked publicly';
  end if;
end $$;

rollback;
