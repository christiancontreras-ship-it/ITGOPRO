begin;

insert into auth.users(
  id,email,encrypted_password,raw_app_meta_data,raw_user_meta_data,aud,role
) values (
  'd0000000-0000-0000-0000-000000000001',
  'renewal-owner@example.test','',
  '{"provider":"email","providers":["email"]}','{}',
  'authenticated','authenticated'
);

set local role authenticated;
set local request.jwt.claims =
  '{"sub":"d0000000-0000-0000-0000-000000000001","role":"authenticated"}';
select public.create_company_with_owner('Renewal Test SpA',null,null) as company_id \gset
reset role;

insert into public.company_subscriptions(
  id,company_id,plan_id,provider,external_reference,payer_email,status,
  current_period_start,current_period_end,authorized_at,created_by
)
select 'd1000000-0000-0000-0000-000000000001',:'company_id',id,'transbank','renewal-lifecycle-test',
  'renewal-owner@example.test','authorized',
  '2026-08-01 12:00:00+00','2026-09-01 12:00:00+00',
  '2026-08-01 12:00:00+00','d0000000-0000-0000-0000-000000000001'
from public.plans where code='company_business';

set local role service_role;
select public.process_subscription_renewals('2026-08-25 12:00:00+00');
select public.process_subscription_renewals('2026-08-25 12:00:00+00');
reset role;

do $$
begin
  if (select count(*) from public.subscription_renewal_events
      where subscription_id='d1000000-0000-0000-0000-000000000001'
        and event_type='reminder_7d') <> 1 then
    raise exception 'renewal reminder is not idempotent';
  end if;
end $$;

set local role service_role;
select public.process_subscription_renewals('2026-09-01 12:00:01+00');
reset role;

do $$
begin
  if (select status from public.company_subscriptions
      where id='d1000000-0000-0000-0000-000000000001') <> 'expired' then
    raise exception 'subscription was not expired';
  end if;
  if private.company_commission_percent((select company_id
      from public.company_subscriptions
      where id='d1000000-0000-0000-0000-000000000001')) <> 20 then
    raise exception 'expired company did not fall back to Free commission';
  end if;
  if (select count(*) from public.subscription_renewal_events
      where subscription_id='d1000000-0000-0000-0000-000000000001'
        and event_type='expired') <> 1 then
    raise exception 'expiration event missing';
  end if;
end $$;

rollback;
