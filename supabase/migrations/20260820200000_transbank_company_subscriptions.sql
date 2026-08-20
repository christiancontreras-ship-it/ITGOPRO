alter table public.company_subscriptions
  drop constraint if exists company_subscriptions_provider_check;

alter table public.company_subscriptions
  alter column provider set default 'transbank',
  add constraint company_subscriptions_provider_check
    check (provider in ('transbank','mercado_pago'));

alter table public.payments
  add column if not exists subscription_id uuid
    references public.company_subscriptions(id);

create index if not exists payments_subscription_created_idx
  on public.payments(subscription_id, created_at desc)
  where subscription_id is not null;

create unique index if not exists payments_one_open_subscription_period_idx
  on public.payments(subscription_id)
  where subscription_id is not null and status in ('pending','authorized');

create or replace function public.initialize_transbank_subscription_payment(p_plan_id uuid)
returns table(payment_id uuid, subscription_id uuid, amount numeric, currency_code text)
language plpgsql security definer set search_path = '' as $$
declare
  v_company uuid;
  v_plan public.plans;
  v_subscription public.company_subscriptions;
  v_payment public.payments;
begin
  if (select auth.uid()) is null then raise exception 'authentication_required'; end if;
  select cm.company_id into v_company
  from public.company_memberships cm
  where cm.user_id=(select auth.uid()) and cm.status='active'
  order by cm.is_primary desc limit 1;
  if v_company is null then raise exception 'company_membership_required'; end if;

  select * into v_plan from public.plans
  where id=p_plan_id and audience='company' and is_active for share;
  if not found or v_plan.code='company_free' or v_plan.price<=0 then
    raise exception 'invalid_subscription_plan';
  end if;

  select * into v_subscription from public.company_subscriptions
  where company_id=v_company and status in ('pending','authorized','paused')
  order by created_at desc limit 1 for update;

  if found and v_subscription.plan_id<>p_plan_id then
    update public.company_subscriptions
      set status='cancelled',cancelled_at=now()
      where id=v_subscription.id;
    v_subscription:=null;
  end if;

  if v_subscription.id is null then
    insert into public.company_subscriptions(
      company_id,plan_id,provider,external_reference,payer_email,created_by,status)
    values(
      v_company,p_plan_id,'transbank',gen_random_uuid()::text,
      coalesce((select email from auth.users where id=(select auth.uid())), 'transbank@invalid.local'),
      (select auth.uid()),'pending')
    returning * into v_subscription;
  else
    update public.company_subscriptions
      set provider='transbank',status='pending',checkout_url=null
      where id=v_subscription.id
      returning * into v_subscription;
  end if;

  select * into v_payment from public.payments
  where subscription_id=v_subscription.id and provider='transbank'
    and status in ('pending','authorized')
  order by created_at desc limit 1 for update;

  if not found then
    insert into public.payments(
      company_id,subscription_id,provider,idempotency_key,amount,currency_code,status,created_by)
    values(
      v_company,v_subscription.id,'transbank',
      'tbk-sub:'||v_subscription.id::text||':'||to_char(now(),'YYYYMM'),
      v_plan.price,v_plan.currency_code,'pending',(select auth.uid()))
    returning * into v_payment;
  elsif v_payment.status='pending' then
    update public.payments set provider_reference=null,provider_buy_order=null,
      provider_redirect_url=null,amount=v_plan.price,updated_at=now()
    where id=v_payment.id returning * into v_payment;
  end if;

  return query select v_payment.id,v_subscription.id,v_payment.amount,v_payment.currency_code;
end $$;

create or replace function public.finalize_transbank_subscription_payment(
  p_payment_id uuid,p_provider_reference text,p_buy_order text,p_amount numeric,
  p_provider_status text,p_response_code integer)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_payment public.payments;
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
    authorized_at=now(),captured_at=now() where id=p_payment_id;
  update public.company_subscriptions set provider='transbank',status='authorized',
    provider_subscription_id=null,checkout_url=null,authorized_at=coalesce(authorized_at,now()),
    current_period_start=now(),current_period_end=now()+interval '1 month',cancelled_at=null
    where id=v_payment.subscription_id;
end $$;

revoke all on function public.initialize_transbank_subscription_payment(uuid) from public,anon;
grant execute on function public.initialize_transbank_subscription_payment(uuid) to authenticated;
revoke all on function public.finalize_transbank_subscription_payment(uuid,text,text,numeric,text,integer) from public,anon,authenticated;
grant execute on function public.finalize_transbank_subscription_payment(uuid,text,text,numeric,text,integer) to service_role;
