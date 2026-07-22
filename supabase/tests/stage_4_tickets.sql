begin;
insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values
('40000000-0000-0000-0000-000000000001','ticket-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('40000000-0000-0000-0000-000000000002','ticket-outsider@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');

set local role authenticated;
set local request.jwt.claims='{"sub":"40000000-0000-0000-0000-000000000001","role":"authenticated"}';
select public.create_company_with_owner('Ticket Test SpA',null,null);

do $$ declare company_uuid uuid; category_uuid uuid; ticket_row public.tickets;
begin
  select company_id into company_uuid from public.company_memberships where user_id=auth.uid();
  select id into category_uuid from public.ticket_categories where code='windows_server';
  insert into public.tickets(company_id,requester_id,category_id,title,description,priority,modality,code)
  values(company_uuid,auth.uid(),category_uuid,'Servidor de prueba','El servidor de prueba no permite el acceso remoto.','critical','remote','') returning * into ticket_row;
  if ticket_row.code !~ '^ITG-[0-9]{4}-[0-9]{6}$' then raise exception 'invalid ticket code'; end if;
  if ticket_row.response_due_at <= ticket_row.created_at or ticket_row.resolution_due_at <= ticket_row.response_due_at then raise exception 'invalid SLA dates'; end if;
  if (select count(*) from public.ticket_status_history where ticket_id=ticket_row.id) <> 1 then raise exception 'missing initial history'; end if;
end $$;

set local request.jwt.claims='{"sub":"40000000-0000-0000-0000-000000000002","role":"authenticated"}';
do $$ begin if (select count(*) from public.tickets) <> 0 then raise exception 'cross-company ticket leak'; end if; end $$;
rollback;
