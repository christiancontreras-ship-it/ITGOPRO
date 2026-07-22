begin;
insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values
('b0000000-0000-0000-0000-000000000001','finance-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),('b0000000-0000-0000-0000-000000000002','finance-specialist@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');
insert into public.specialist_profiles(user_id,public_name,professional_title,bio,hourly_rate,approval_status) values('b0000000-0000-0000-0000-000000000002','Finance Specialist','DBA','Perfil sintético para validar pagos y comisiones balanceadas.',50000,'approved') returning id as specialist_id \gset
set local role authenticated; set local request.jwt.claims='{"sub":"b0000000-0000-0000-0000-000000000001","role":"authenticated"}'; select public.create_company_with_owner('Finance Test SpA',null,null) as company_id \gset
insert into public.tickets(code,company_id,requester_id,category_id,title,description,priority,status,modality,assigned_specialist_id) select '',:'company_id',auth.uid(),id,'Pago seguro','Ticket sintético para validar el libro mayor de doble entrada.','medium','in_progress','remote',:'specialist_id' from public.ticket_categories where code='postgresql' returning id as ticket_id \gset
select public.create_manual_ticket_payment(:'ticket_id',100000,'financial-test-1',20) as payment_id \gset
select public.create_manual_ticket_payment(:'ticket_id',100000,'financial-test-1',20);
reset role;
do $$ begin if(select count(*) from public.payments)<>1 then raise exception 'idempotency failed'; end if; if(select sum(case direction when 'debit' then amount else -amount end) from public.ledger_entries)<>0 then raise exception 'ledger is unbalanced'; end if; end $$;
rollback;
