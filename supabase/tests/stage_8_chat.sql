begin;
insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values
('80000000-0000-0000-0000-000000000001','chat-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('80000000-0000-0000-0000-000000000002','chat-specialist@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('80000000-0000-0000-0000-000000000003','chat-outsider@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');
insert into public.specialist_profiles(user_id,public_name,professional_title,bio,hourly_rate,approval_status)
values('80000000-0000-0000-0000-000000000002','Chat Specialist','Ingeniero','Perfil sintético suficiente para verificar aislamiento de mensajes realtime.',40000,'approved') returning id as specialist_id \gset
set local role authenticated;
set local request.jwt.claims='{"sub":"80000000-0000-0000-0000-000000000001","role":"authenticated"}';
select public.create_company_with_owner('Chat Test SpA',null,null) as company_id \gset
insert into public.tickets(code,company_id,requester_id,category_id,title,description,priority,status,modality,assigned_specialist_id)
select '',:'company_id',auth.uid(),id,'Chat seguro','Ticket sintético con participante asignado para validar chat.','medium','assigned','remote',:'specialist_id' from public.ticket_categories where code='linux' returning id as ticket_id \gset
insert into public.ticket_messages(ticket_id,sender_id,body) values(:'ticket_id',auth.uid(),'Mensaje visible para participantes');
insert into public.ticket_messages(ticket_id,sender_id,body,visibility) values(:'ticket_id',auth.uid(),'Nota interna','company_internal');
set local request.jwt.claims='{"sub":"80000000-0000-0000-0000-000000000002","role":"authenticated"}';
do $$ begin if(select count(*) from public.ticket_messages)<>1 then raise exception 'internal message leaked or participant message missing'; end if; end $$;
insert into public.ticket_messages(ticket_id,sender_id,body) values(:'ticket_id',auth.uid(),'Respuesta del especialista');
set local request.jwt.claims='{"sub":"80000000-0000-0000-0000-000000000003","role":"authenticated"}';
do $$ begin if(select count(*) from public.ticket_messages)<>0 then raise exception 'chat leaked to outsider'; end if; end $$;
rollback;
