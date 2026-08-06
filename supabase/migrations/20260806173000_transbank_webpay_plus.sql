alter table public.payments
  add column if not exists provider_buy_order text,
  add column if not exists provider_redirect_url text;

create unique index if not exists payments_transbank_buy_order_unique
  on public.payments(provider_buy_order)
  where provider = 'transbank' and provider_buy_order is not null;

create or replace function public.initialize_transbank_ticket_payment(p_ticket_id uuid)
returns table(payment_id uuid, amount numeric, currency_code text)
language plpgsql security definer set search_path = '' as $$
declare v_ticket public.tickets; v_payment public.payments;
begin
  if (select auth.uid()) is null then raise exception 'authentication_required'; end if;
  select * into v_ticket from public.tickets where id=p_ticket_id for update;
  if not found or not private.user_is_company_member(v_ticket.company_id) then raise exception 'not_found_or_forbidden'; end if;
  if v_ticket.status <> 'closed' or v_ticket.final_cost is null or v_ticket.final_cost <= 0 then raise exception 'ticket_not_payable'; end if;
  select * into v_payment from public.payments where ticket_id=p_ticket_id and provider='transbank'
    and status in ('pending','authorized','captured') order by created_at desc limit 1 for update;
  if not found then
    insert into public.payments(company_id,ticket_id,provider,idempotency_key,amount,currency_code,status,created_by)
    values(v_ticket.company_id,p_ticket_id,'transbank','tbk:'||p_ticket_id::text,v_ticket.final_cost,'CLP','pending',(select auth.uid()))
    returning * into v_payment;
  end if;
  return query select v_payment.id,v_payment.amount,v_payment.currency_code;
end $$;

create or replace function public.finalize_transbank_ticket_payment(
  p_payment_id uuid,p_provider_reference text,p_buy_order text,p_amount numeric,p_provider_status text,p_response_code integer)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_payment public.payments; v_specialist uuid; v_tx uuid; v_cash uuid; v_revenue uuid; v_payable uuid;
  v_platform numeric; v_specialist_amount numeric; v_commission_percent numeric := 20;
begin
  if current_user not in ('service_role','postgres') then raise exception 'forbidden'; end if;
  select * into v_payment from public.payments where id=p_payment_id and provider='transbank' for update;
  if not found then raise exception 'payment_not_found'; end if;
  if v_payment.status='captured' then return; end if;
  if v_payment.provider_buy_order is distinct from p_buy_order then raise exception 'payment_buy_order_mismatch'; end if;
  if p_provider_status <> 'AUTHORIZED' or p_response_code <> 0 then
    update public.payments set status='failed',provider_reference=p_provider_reference where id=p_payment_id; return;
  end if;
  if p_amount <> v_payment.amount then raise exception 'payment_amount_mismatch'; end if;
  select assigned_specialist_id into v_specialist from public.tickets where id=v_payment.ticket_id;
  if v_specialist is null then raise exception 'ticket_without_specialist'; end if;
  v_platform:=round(v_payment.amount*v_commission_percent/100,2); v_specialist_amount:=v_payment.amount-v_platform;
  update public.payments set status='captured',provider_reference=p_provider_reference,authorized_at=now(),captured_at=now() where id=p_payment_id;
  insert into public.commissions(payment_id,specialist_id,gross_amount,commission_percent,platform_amount,specialist_amount,status)
  values(p_payment_id,v_specialist,v_payment.amount,v_commission_percent,v_platform,v_specialist_amount,'available') on conflict(payment_id) do nothing;
  select id into v_cash from public.financial_accounts where owner_type='platform' and owner_id is null and account_type='cash' and currency_code='CLP';
  if v_cash is null then insert into public.financial_accounts(owner_type,owner_id,account_type) values('platform',null,'cash') returning id into v_cash; end if;
  select id into v_revenue from public.financial_accounts where owner_type='platform' and owner_id is null and account_type='revenue' and currency_code='CLP';
  if v_revenue is null then insert into public.financial_accounts(owner_type,owner_id,account_type) values('platform',null,'revenue') returning id into v_revenue; end if;
  insert into public.financial_accounts(owner_type,owner_id,account_type) values('specialist',v_specialist,'payable')
    on conflict(owner_type,owner_id,account_type,currency_code) do update set owner_type=excluded.owner_type returning id into v_payable;
  insert into public.ledger_transactions(payment_id,description,created_by) values(p_payment_id,'Captura Transbank Webpay Plus de ticket',v_payment.created_by)
    on conflict(payment_id) do nothing returning id into v_tx;
  if v_tx is not null then insert into public.ledger_entries(transaction_id,account_id,direction,amount,currency_code)
    values(v_tx,v_cash,'debit',v_payment.amount,'CLP'),(v_tx,v_revenue,'credit',v_platform,'CLP'),(v_tx,v_payable,'credit',v_specialist_amount,'CLP'); end if;
end $$;

revoke all on function public.initialize_transbank_ticket_payment(uuid) from public,anon;
grant execute on function public.initialize_transbank_ticket_payment(uuid) to authenticated;
revoke all on function public.finalize_transbank_ticket_payment(uuid,text,text,numeric,text,integer) from public,anon,authenticated;
grant execute on function public.finalize_transbank_ticket_payment(uuid,text,text,numeric,text,integer) to service_role;
