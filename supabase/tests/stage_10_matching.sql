begin;
insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values
('a0000000-0000-0000-0000-000000000001','match-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('a0000000-0000-0000-0000-000000000002','match-specialist@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');
insert into public.specialist_profiles(user_id,public_name,professional_title,bio,hourly_rate,approval_status,availability_status,rating_average)
values('a0000000-0000-0000-0000-000000000002','Match Specialist','Linux Expert','Perfil sintético para validar ranking determinístico y explicable.',40000,'approved','available',4.5) returning id as specialist_id \gset
insert into public.specialist_skills(specialist_id,skill_id,proficiency) select :'specialist_id',id,'expert' from public.skills where code='linux';
set local role authenticated; set local request.jwt.claims='{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}';
select public.create_company_with_owner('Match Test SpA',null,null) as company_id \gset
insert into public.tickets(code,company_id,requester_id,category_id,title,description,priority,status,modality,estimated_cost)
select '',:'company_id',auth.uid(),id,'Matching Linux','Ticket sintético para probar la puntuación del motor determinístico.','medium','published','remote',100000 from public.ticket_categories where code='linux' returning id as ticket_id \gset
select public.generate_ticket_matches(:'ticket_id') as run_id \gset
do $$ begin if(select max(total_score) from public.ticket_match_results)<90 then raise exception 'expected strong deterministic match'; end if; end $$;
rollback;
