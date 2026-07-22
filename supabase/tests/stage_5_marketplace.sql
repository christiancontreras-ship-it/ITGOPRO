begin;
insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values
('50000000-0000-0000-0000-000000000001','market-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('50000000-0000-0000-0000-000000000002','market-specialist@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('50000000-0000-0000-0000-000000000003','market-outsider@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');
insert into public.specialist_profiles(user_id,public_name,professional_title,bio,hourly_rate,approval_status,availability_status)
values('50000000-0000-0000-0000-000000000002','Especialista Demo','Arquitecto Cloud','Perfil sintético utilizado exclusivamente para validar el aislamiento del marketplace.',50000,'approved','available');

set local role authenticated;
set local request.jwt.claims='{"sub":"50000000-0000-0000-0000-000000000001","role":"authenticated"}';
select public.create_company_with_owner('Marketplace Test SpA',null,null);
do $$ declare company_uuid uuid; specialist_uuid uuid; begin
 select company_id into company_uuid from public.company_memberships where user_id=auth.uid();
 select id into specialist_uuid from public.specialist_profiles where public_name='Especialista Demo';
 insert into public.company_favorite_specialists(company_id,specialist_id,created_by) values(company_uuid,specialist_uuid,auth.uid());
 if (select count(*) from public.specialist_profiles)<>1 then raise exception 'approved specialist not visible'; end if;
end $$;
set local request.jwt.claims='{"sub":"50000000-0000-0000-0000-000000000003","role":"authenticated"}';
do $$ begin if(select count(*) from public.company_favorite_specialists)<>0 then raise exception 'favorite leaked across companies'; end if; end $$;
rollback;
