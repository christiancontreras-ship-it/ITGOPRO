create table public.company_subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  plan_id uuid not null references public.plans(id),
  provider text not null default 'mercado_pago' check (provider in ('mercado_pago')),
  provider_subscription_id text unique,
  external_reference text not null unique,
  payer_email text not null,
  checkout_url text,
  status text not null default 'pending' check (status in ('pending','authorized','paused','cancelled','failed')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  authorized_at timestamptz,
  cancelled_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index company_subscriptions_company_created_idx
  on public.company_subscriptions(company_id, created_at desc);
create unique index company_subscriptions_one_current_idx
  on public.company_subscriptions(company_id)
  where status in ('pending','authorized','paused');
create trigger company_subscriptions_updated_at before update on public.company_subscriptions
  for each row execute function public.set_updated_at();

alter table public.company_subscriptions enable row level security;
alter table public.company_subscriptions force row level security;
create policy company_subscriptions_company_read on public.company_subscriptions
  for select to authenticated
  using ((select private.user_is_company_member(company_id)));
grant select on public.company_subscriptions to authenticated;

create or replace function public.initialize_company_subscription(p_plan_id uuid, p_payer_email text)
returns table(subscription_id uuid, plan_name text, amount numeric, currency_code text)
language plpgsql security definer set search_path = '' as $$
declare v_company uuid; v_plan public.plans; v_subscription public.company_subscriptions;
begin
  if (select auth.uid()) is null then raise exception 'authentication_required'; end if;
  select cm.company_id into v_company from public.company_memberships cm
    where cm.user_id=(select auth.uid()) and cm.status='active' order by cm.is_primary desc limit 1;
  if v_company is null then raise exception 'company_membership_required'; end if;
  select * into v_plan from public.plans where id=p_plan_id and audience='company' and is_active for share;
  if not found or v_plan.code='company_free' or v_plan.price<=0 then raise exception 'invalid_subscription_plan'; end if;
  if nullif(trim(p_payer_email),'') is null then raise exception 'payer_email_required'; end if;

  select * into v_subscription from public.company_subscriptions
    where company_id=v_company and status in ('pending','authorized','paused') for update;
  if found and v_subscription.plan_id<>p_plan_id then
    update public.company_subscriptions set status='cancelled',cancelled_at=now() where id=v_subscription.id;
    v_subscription:=null;
  end if;
  if v_subscription.id is null then
    insert into public.company_subscriptions(company_id,plan_id,external_reference,payer_email,created_by)
    values(v_company,p_plan_id,gen_random_uuid()::text,lower(trim(p_payer_email)),(select auth.uid())) returning * into v_subscription;
  end if;
  return query select v_subscription.id,v_plan.name,v_plan.price,v_plan.currency_code;
end $$;

create or replace function public.sync_company_subscription(
  p_subscription_id uuid,p_provider_subscription_id text,p_status text,p_checkout_url text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_status text;
begin
  if current_user not in ('service_role','postgres') then raise exception 'forbidden'; end if;
  v_status:=case p_status when 'authorized' then 'authorized' when 'paused' then 'paused'
    when 'cancelled' then 'cancelled' when 'cancelled_by_user' then 'cancelled'
    when 'pending' then 'pending' else 'failed' end;
  update public.company_subscriptions set provider_subscription_id=p_provider_subscription_id,
    checkout_url=coalesce(p_checkout_url,checkout_url),status=v_status,
    authorized_at=case when v_status='authorized' then coalesce(authorized_at,now()) else authorized_at end,
    current_period_start=case when v_status='authorized' then coalesce(current_period_start,now()) else current_period_start end,
    current_period_end=case when v_status='authorized' then now()+interval '1 month' else current_period_end end,
    cancelled_at=case when v_status='cancelled' then now() else cancelled_at end
  where id=p_subscription_id;
  if not found then raise exception 'subscription_not_found'; end if;
end $$;

create or replace function private.company_commission_percent(p_company_id uuid)
returns numeric language sql stable security invoker set search_path='' as $$
  select coalesce((select pl.commission_percent from public.company_subscriptions cs
    join public.plans pl on pl.id=cs.plan_id where cs.company_id=p_company_id and cs.status='authorized'
    order by cs.authorized_at desc limit 1),20::numeric)
$$;

revoke all on function public.initialize_company_subscription(uuid,text) from public,anon;
grant execute on function public.initialize_company_subscription(uuid,text) to authenticated;
revoke all on function public.sync_company_subscription(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.sync_company_subscription(uuid,text,text,text) to service_role;
