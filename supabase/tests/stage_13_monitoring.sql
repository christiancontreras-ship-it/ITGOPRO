begin;
insert into auth.users(id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role) values('d0000000-0000-0000-0000-000000000001','monitor-owner@example.test','', '{"provider":"email","providers":["email"]}','{}','authenticated','authenticated');
set local role authenticated; set local request.jwt.claims='{"sub":"d0000000-0000-0000-0000-000000000001","role":"authenticated"}'; select public.create_company_with_owner('Monitor Test SpA',null,null) as company_id \gset
reset role; insert into public.monitoring_assets(company_id,name,asset_type,status) values(:'company_id','srv-test','server','critical') returning id as asset_id \gset
insert into public.monitoring_alerts(asset_id,external_alert_id,severity,title,description,occurred_at) values(:'asset_id','alert-1','critical','Servidor sin respuesta','El activo no responde a las comprobaciones de disponibilidad.',now()) returning id as alert_id \gset
set local role service_role; select public.create_ticket_from_critical_alert(:'alert_id'); select public.create_ticket_from_critical_alert(:'alert_id'); reset role;
do $$ begin if(select count(*) from public.tickets where title like '[MON]%')<>1 then raise exception 'critical alert ticket is not idempotent'; end if; end $$;
rollback;
