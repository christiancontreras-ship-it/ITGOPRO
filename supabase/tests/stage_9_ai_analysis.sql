begin;
insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values
('90000000-0000-0000-0000-000000000001','ai-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('90000000-0000-0000-0000-000000000002','ai-outsider@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');
set local role authenticated;
set local request.jwt.claims='{"sub":"90000000-0000-0000-0000-000000000001","role":"authenticated"}';
select public.create_company_with_owner('AI Test SpA',null,null) as company_id \gset
insert into public.tickets(code,company_id,requester_id,category_id,title,description,priority,status,modality)
select '',:'company_id',auth.uid(),id,'Análisis IA','Ticket sintético utilizado para validar persistencia segura del análisis.','medium','new','remote' from public.ticket_categories where code='linux' returning id as ticket_id \gset
insert into public.ticket_ai_analyses(ticket_id,requested_by,model,prompt_version,technical_summary)
values(:'ticket_id',auth.uid(),'test-model','test-v1','Resumen sintético validado sin invocar un proveedor externo.');
set local request.jwt.claims='{"sub":"90000000-0000-0000-0000-000000000002","role":"authenticated"}';
do $$ begin if(select count(*) from public.ticket_ai_analyses)<>0 then raise exception 'analysis leaked across companies'; end if; end $$;
rollback;
