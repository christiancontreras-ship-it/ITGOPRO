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
  from public.company_memberships as cm
  where cm.user_id=(select auth.uid()) and cm.status='active'
  order by cm.is_primary desc limit 1;
  if v_company is null then raise exception 'company_membership_required'; end if;

  select p.* into v_plan from public.plans as p
  where p.id=p_plan_id and p.audience='company' and p.is_active for share;
  if not found or v_plan.code='company_free' or v_plan.price<=0 then
    raise exception 'invalid_subscription_plan';
  end if;

  select cs.* into v_subscription from public.company_subscriptions as cs
  where cs.company_id=v_company and cs.status in ('pending','authorized','paused')
  order by cs.created_at desc limit 1 for update;

  if found and v_subscription.plan_id<>p_plan_id then
    update public.company_subscriptions as cs
      set status='cancelled',cancelled_at=now()
      where cs.id=v_subscription.id;
    v_subscription:=null;
  end if;

  if v_subscription.id is null then
    insert into public.company_subscriptions(
      company_id,plan_id,provider,external_reference,payer_email,created_by,status)
    values(
      v_company,p_plan_id,'transbank',gen_random_uuid()::text,
      coalesce((select u.email from auth.users as u where u.id=(select auth.uid())), 'transbank@invalid.local'),
      (select auth.uid()),'pending')
    returning * into v_subscription;
  else
    update public.company_subscriptions as cs
      set provider='transbank',status='pending',checkout_url=null
      where cs.id=v_subscription.id
      returning * into v_subscription;
  end if;

  select p.* into v_payment from public.payments as p
  where p.subscription_id=v_subscription.id and p.provider='transbank'
    and p.status in ('pending','authorized')
  order by p.created_at desc limit 1 for update;

  if not found then
    insert into public.payments(
      company_id,subscription_id,provider,idempotency_key,amount,currency_code,status,created_by)
    values(
      v_company,v_subscription.id,'transbank',
      'tbk-sub:'||v_subscription.id::text||':'||to_char(now(),'YYYYMM'),
      v_plan.price,v_plan.currency_code,'pending',(select auth.uid()))
    returning * into v_payment;
  elsif v_payment.status='pending' then
    update public.payments as p set provider_reference=null,provider_buy_order=null,
      provider_redirect_url=null,amount=v_plan.price,updated_at=now()
    where p.id=v_payment.id returning * into v_payment;
  end if;

  return query select v_payment.id,v_subscription.id,v_payment.amount,v_payment.currency_code;
end $$;

revoke all on function public.initialize_transbank_subscription_payment(uuid) from public,anon;
grant execute on function public.initialize_transbank_subscription_payment(uuid) to authenticated;
