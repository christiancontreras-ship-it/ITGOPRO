begin;
insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values('e0000000-0000-0000-0000-000000000001','partner-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),('e0000000-0000-0000-0000-000000000002','partner-outsider@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');
set local role authenticated; set local request.jwt.claims='{"sub":"e0000000-0000-0000-0000-000000000001","role":"authenticated"}'; select public.create_company_with_owner('Partner Test SpA',null,null) as company_id \gset
reset role; insert into public.partner_profiles(company_id,status) values(:'company_id','approved');
set local role authenticated; set local request.jwt.claims='{"sub":"e0000000-0000-0000-0000-000000000002","role":"authenticated"}'; do $$ begin if(select count(*) from public.partner_profiles)<>0 then raise exception 'partner leaked to outsider'; end if; end $$;
rollback;
