create table public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('mercado_pago','transbank')),
  request_id text not null,
  provider_resource_id text,
  event_type text,
  action text,
  signature_valid boolean not null default false,
  status text not null default 'received' check (status in ('received','processed','ignored','failed')),
  error_code text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider,request_id)
);

create table public.specialist_payouts (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.specialist_profiles(id),
  currency_code text not null default 'CLP' references public.currencies(code),
  amount numeric(14,2) not null check(amount > 0),
  status text not null default 'requested' check(status in ('requested','approved','processing','paid','rejected','cancelled','failed')),
  idempotency_key text not null unique,
  bank_reference text,
  proof_reference text,
  notes text,
  requested_by uuid not null references public.profiles(id),
  approved_by uuid references public.profiles(id),
  paid_by uuid references public.profiles(id),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.specialist_payout_items (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null references public.specialist_payouts(id) on delete restrict,
  commission_id uuid not null unique references public.commissions(id) on delete restrict,
  amount numeric(14,2) not null check(amount > 0),
  created_at timestamptz not null default now(),
  unique(payout_id,commission_id)
);

create index payment_webhook_events_resource_idx on public.payment_webhook_events(provider,provider_resource_id);
create index specialist_payouts_specialist_created_idx on public.specialist_payouts(specialist_id,created_at desc);
create index specialist_payouts_status_idx on public.specialist_payouts(status,created_at);
create index specialist_payout_items_payout_idx on public.specialist_payout_items(payout_id);
create trigger specialist_payouts_updated_at before update on public.specialist_payouts for each row execute function public.set_updated_at();

alter table public.payment_webhook_events enable row level security;
alter table public.payment_webhook_events force row level security;
alter table public.specialist_payouts enable row level security;
alter table public.specialist_payouts force row level security;
alter table public.specialist_payout_items enable row level security;
alter table public.specialist_payout_items force row level security;

create or replace function private.is_platform_finance_admin()
returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.platform_user_roles pur
    join public.roles r on r.id=pur.role_id
    where pur.user_id=(select auth.uid()) and pur.revoked_at is null
      and (pur.expires_at is null or pur.expires_at>now())
      and r.code in ('platform_super_admin','platform_admin')
  )
$$;
revoke all on function private.is_platform_finance_admin() from public,anon;
grant execute on function private.is_platform_finance_admin() to authenticated;

create policy specialist_payouts_own_read on public.specialist_payouts for select to authenticated
using(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())) or (select private.is_platform_finance_admin()));
create policy specialist_payout_items_own_read on public.specialist_payout_items for select to authenticated
using(exists(select 1 from public.specialist_payouts p join public.specialist_profiles s on s.id=p.specialist_id where p.id=payout_id and s.user_id=(select auth.uid())) or (select private.is_platform_finance_admin()));
create policy payment_webhook_events_admin_read on public.payment_webhook_events for select to authenticated using((select private.is_platform_finance_admin()));
grant select on public.specialist_payouts,public.specialist_payout_items,public.payment_webhook_events to authenticated;

create or replace function public.request_specialist_payout(p_idempotency_key text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_specialist uuid; v_payout uuid; v_amount numeric;
begin
  if (select auth.uid()) is null then raise exception 'authentication_required'; end if;
  if length(trim(p_idempotency_key))<8 then raise exception 'invalid_idempotency_key'; end if;
  select id into v_specialist from public.specialist_profiles where user_id=(select auth.uid()) and approval_status='approved' and deleted_at is null;
  if v_specialist is null then raise exception 'approved_specialist_required'; end if;
  select id into v_payout from public.specialist_payouts where idempotency_key=p_idempotency_key;
  if found then return v_payout; end if;
  perform 1 from public.commissions where specialist_id=v_specialist and status='available' for update;
  select coalesce(sum(specialist_amount),0) into v_amount from public.commissions where specialist_id=v_specialist and status='available';
  if v_amount<=0 then raise exception 'no_available_balance'; end if;
  insert into public.specialist_payouts(specialist_id,amount,idempotency_key,requested_by) values(v_specialist,v_amount,p_idempotency_key,(select auth.uid())) returning id into v_payout;
  insert into public.specialist_payout_items(payout_id,commission_id,amount)
    select v_payout,id,specialist_amount from public.commissions where specialist_id=v_specialist and status='available';
  update public.commissions c set status='held' where exists(select 1 from public.specialist_payout_items i where i.payout_id=v_payout and i.commission_id=c.id);
  return v_payout;
end $$;

create or replace function public.approve_specialist_payout(p_payout_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  if not private.is_platform_finance_admin() then raise exception 'forbidden'; end if;
  update public.specialist_payouts set status='approved',approved_by=(select auth.uid()),approved_at=now() where id=p_payout_id and status='requested';
  if not found then raise exception 'payout_not_approvable'; end if;
end $$;

create or replace function public.record_specialist_payout_transfer(p_payout_id uuid,p_bank_reference text,p_proof_reference text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_payout public.specialist_payouts;
begin
  if not private.is_platform_finance_admin() then raise exception 'forbidden'; end if;
  if length(trim(p_bank_reference))<3 then raise exception 'bank_reference_required'; end if;
  select * into v_payout from public.specialist_payouts where id=p_payout_id for update;
  if not found then raise exception 'payout_not_found'; end if;
  if v_payout.status='paid' then
    if v_payout.bank_reference=p_bank_reference then return; end if;
    raise exception 'payout_already_paid';
  end if;
  if v_payout.status<>'approved' then raise exception 'payout_not_approved'; end if;
  update public.specialist_payouts set status='paid',bank_reference=trim(p_bank_reference),proof_reference=nullif(trim(p_proof_reference),''),paid_by=(select auth.uid()),paid_at=now() where id=p_payout_id;
  update public.commissions c set status='paid' where exists(select 1 from public.specialist_payout_items i where i.payout_id=p_payout_id and i.commission_id=c.id);
end $$;

revoke all on function public.request_specialist_payout(text),public.approve_specialist_payout(uuid),public.record_specialist_payout_transfer(uuid,text,text) from public,anon;
grant execute on function public.request_specialist_payout(text),public.approve_specialist_payout(uuid),public.record_specialist_payout_transfer(uuid,text,text) to authenticated;

revoke all on public.payment_webhook_events,public.specialist_payouts,public.specialist_payout_items from anon;
grant all on public.payment_webhook_events to service_role;
