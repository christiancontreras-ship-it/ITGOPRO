-- Ciclo operativo de renovaciones de planes de empresa.
alter table public.company_subscriptions
  drop constraint if exists company_subscriptions_status_check;

alter table public.company_subscriptions
  add constraint company_subscriptions_status_check
  check (status in ('pending','authorized','paused','cancelled','failed','expired'));

alter table public.payments
  add column if not exists subscription_period_start timestamptz,
  add column if not exists subscription_period_end timestamptz;

update public.payments p
set subscription_period_start=cs.current_period_start,
    subscription_period_end=cs.current_period_end
from public.company_subscriptions cs
where p.subscription_id=cs.id
  and p.status='captured'
  and p.subscription_period_start is null;

create index if not exists payments_subscription_period_idx
  on public.payments(subscription_id,subscription_period_end desc)
  where subscription_id is not null;

create table public.subscription_renewal_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.company_subscriptions(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  event_type text not null check (
    event_type in ('reminder_7d','reminder_3d','reminder_1d','expired','renewed')
  ),
  period_end timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint subscription_renewal_events_metadata_object
    check (jsonb_typeof(metadata) = 'object'),
  unique (subscription_id,event_type,period_end)
);

comment on table public.subscription_renewal_events is
  'Eventos idempotentes del ciclo de renovación; alimentan avisos, historial y auditoría.';

create index subscription_renewal_events_company_created_idx
  on public.subscription_renewal_events(company_id,created_at desc);
create index subscription_renewal_events_subscription_created_idx
  on public.subscription_renewal_events(subscription_id,created_at desc);

alter table public.subscription_renewal_events enable row level security;
alter table public.subscription_renewal_events force row level security;

create policy subscription_renewal_events_company_read
  on public.subscription_renewal_events
  for select to authenticated
  using ((select private.user_is_company_member(company_id)));

grant select on public.subscription_renewal_events to authenticated;
revoke insert,update,delete on public.subscription_renewal_events from public,anon,authenticated;

create or replace function public.process_subscription_renewals(
  p_now timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reminders integer := 0;
  v_expired integer := 0;
begin
  with due_reminders as (
    select
      cs.id as subscription_id,
      cs.company_id,
      cs.current_period_end as period_end,
      case ((cs.current_period_end at time zone 'America/Santiago')::date
        - (p_now at time zone 'America/Santiago')::date)
        when 7 then 'reminder_7d'
        when 3 then 'reminder_3d'
        when 1 then 'reminder_1d'
      end as event_type,
      pl.name as plan_name
    from public.company_subscriptions cs
    join public.plans pl on pl.id=cs.plan_id
    where cs.status='authorized'
      and cs.current_period_end is not null
      and ((cs.current_period_end at time zone 'America/Santiago')::date
        - (p_now at time zone 'America/Santiago')::date) in (7,3,1)
  ), inserted as (
    insert into public.subscription_renewal_events(
      subscription_id,company_id,event_type,period_end,metadata)
    select subscription_id,company_id,event_type,period_end,
      jsonb_build_object('plan_name',plan_name,'days_remaining',
        (period_end at time zone 'America/Santiago')::date
          - (p_now at time zone 'America/Santiago')::date)
    from due_reminders
    on conflict (subscription_id,event_type,period_end) do nothing
    returning *
  )
  select count(*) into v_reminders from inserted;

  with due_expirations as (
    select cs.id,cs.company_id,cs.current_period_end,pl.name as plan_name
    from public.company_subscriptions cs
    join public.plans pl on pl.id=cs.plan_id
    where cs.status='authorized'
      and cs.current_period_end is not null
      and cs.current_period_end <= p_now
    for update of cs
  ), expired_subscriptions as (
    update public.company_subscriptions cs
      set status='expired',updated_at=p_now
    from due_expirations de
    where cs.id=de.id
    returning cs.id,cs.company_id,cs.current_period_end,de.plan_name
  ), inserted_events as (
    insert into public.subscription_renewal_events(
      subscription_id,company_id,event_type,period_end,metadata)
    select id,company_id,'expired',current_period_end,
      jsonb_build_object('plan_name',plan_name,'fallback_plan','Free')
    from expired_subscriptions
    on conflict (subscription_id,event_type,period_end) do nothing
    returning *
  ), inserted_audit as (
    insert into public.audit_events(
      event_type,company_id,entity_type,entity_id,action,outcome,source,metadata)
    select 'subscription.expired',company_id,'company_subscription',subscription_id,
      'expire','success','subscription_renewal_cron',
      jsonb_build_object('period_end',period_end,'fallback_plan','Free')
    from inserted_events
    returning id
  )
  select count(*) into v_expired from inserted_audit;

  return jsonb_build_object(
    'processed_at',p_now,
    'reminders_created',v_reminders,
    'subscriptions_expired',v_expired
  );
end;
$$;

comment on function public.process_subscription_renewals(timestamptz) is
  'Procesa avisos 7/3/1 días y expira planes vencidos. Solo invocable por service_role.';

revoke all on function public.process_subscription_renewals(timestamptz)
  from public,anon,authenticated;
grant execute on function public.process_subscription_renewals(timestamptz)
  to service_role;

create or replace function public.finalize_transbank_subscription_payment(
  p_payment_id uuid,p_provider_reference text,p_buy_order text,p_amount numeric,
  p_provider_status text,p_response_code integer)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_payment public.payments;
  v_period_start timestamptz := now();
  v_period_end timestamptz := now()+interval '1 month';
begin
  if current_user not in ('service_role','postgres') then raise exception 'forbidden'; end if;
  select * into v_payment from public.payments
  where id=p_payment_id and provider='transbank' and subscription_id is not null for update;
  if not found then raise exception 'subscription_payment_not_found'; end if;
  if v_payment.status='captured' then return; end if;
  if v_payment.provider_buy_order is distinct from p_buy_order then raise exception 'payment_buy_order_mismatch'; end if;
  if p_provider_status <> 'AUTHORIZED' or p_response_code <> 0 then
    update public.payments set status='failed',provider_reference=p_provider_reference where id=p_payment_id;
    update public.company_subscriptions set status='failed' where id=v_payment.subscription_id;
    return;
  end if;
  if p_amount <> v_payment.amount then raise exception 'payment_amount_mismatch'; end if;

  update public.payments set status='captured',provider_reference=p_provider_reference,
    authorized_at=v_period_start,captured_at=v_period_start,
    subscription_period_start=v_period_start,subscription_period_end=v_period_end
    where id=p_payment_id;
  update public.company_subscriptions set provider='transbank',status='authorized',
    provider_subscription_id=null,checkout_url=null,authorized_at=coalesce(authorized_at,v_period_start),
    current_period_start=v_period_start,current_period_end=v_period_end,cancelled_at=null
    where id=v_payment.subscription_id;

  insert into public.subscription_renewal_events(
    subscription_id,company_id,event_type,period_end,metadata)
  values (
    v_payment.subscription_id,v_payment.company_id,'renewed',v_period_end,
    jsonb_build_object('payment_id',p_payment_id,'provider','transbank',
      'period_start',v_period_start,'amount',v_payment.amount,
      'currency_code',v_payment.currency_code))
  on conflict (subscription_id,event_type,period_end) do nothing;
end $$;

-- Endurecer las funciones privilegiadas del flujo de suscripción.
revoke all on function public.initialize_transbank_subscription_payment(uuid)
  from public,anon;
grant execute on function public.initialize_transbank_subscription_payment(uuid)
  to authenticated;
revoke all on function public.finalize_transbank_subscription_payment(
  uuid,text,text,numeric,text,integer
) from public,anon,authenticated;
grant execute on function public.finalize_transbank_subscription_payment(
  uuid,text,text,numeric,text,integer
) to service_role;
