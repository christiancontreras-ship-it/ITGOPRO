begin;

insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values
('70000000-0000-0000-0000-000000000001','assignment-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated'),
('70000000-0000-0000-0000-000000000002','assignment-specialist@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');

insert into public.specialist_profiles(user_id,public_name,professional_title,bio,hourly_rate,approval_status,availability_status)
values('70000000-0000-0000-0000-000000000002','Especialista Asignación','Ingeniero de plataforma','Perfil sintético para probar la asignación transaccional de un ticket.',50000,'approved','available')
returning id as specialist_id \gset

set local role authenticated;
set local request.jwt.claims='{"sub":"70000000-0000-0000-0000-000000000001","role":"authenticated"}';
select public.create_company_with_owner('Asignación Test SpA',null,null) as company_id \gset
insert into public.tickets(code,company_id,requester_id,category_id,title,description,priority,status,modality,published_at)
select '',:'company_id',auth.uid(),id,'Servidor de pruebas sin acceso','Se requiere diagnóstico y recuperación controlada del servicio afectado.','high','published','remote',now()
from public.ticket_categories where code='linux' returning id as ticket_id \gset

set local request.jwt.claims='{"sub":"70000000-0000-0000-0000-000000000002","role":"authenticated"}';
insert into public.ticket_applications(ticket_id,specialist_id,status,billing_type,amount,estimated_hours,available_from,estimated_end_at,modality,solution_summary,valid_until,submitted_at)
values(:'ticket_id',:'specialist_id','submitted','fixed',120000,3,now()+interval '1 hour',now()+interval '4 hours','remote','Diagnóstico, recuperación controlada y entrega de evidencia técnica del resultado.',now()+interval '12 hours',now())
returning id as application_id \gset

set local request.jwt.claims='{"sub":"70000000-0000-0000-0000-000000000001","role":"authenticated"}';
select public.select_ticket_candidate(:'ticket_id',:'application_id') as assignment_id \gset

do $$ begin
  if (select status from public.tickets where title='Servidor de pruebas sin acceso') <> 'waiting_specialist' then
    raise exception 'ticket was not reserved for acceptance';
  end if;
end $$;

set local request.jwt.claims='{"sub":"70000000-0000-0000-0000-000000000002","role":"authenticated"}';
select public.respond_ticket_assignment(:'assignment_id',true,null);
select public.start_ticket_work(:'assignment_id');

do $$ begin
  if (select status from public.tickets where title='Servidor de pruebas sin acceso') <> 'in_progress' then
    raise exception 'accepted assignment did not start';
  end if;
  if (select count(*) from public.ticket_assignments where status='started') <> 1 then
    raise exception 'active assignment invariant failed';
  end if;
end $$;

rollback;
