create or replace function public.initialize_transbank_ticket_payment(p_ticket_id uuid)
returns table(payment_id uuid, amount numeric, currency_code text)
language plpgsql security definer set search_path = '' as $$
declare v_ticket public.tickets; v_payment public.payments;
begin
  if (select auth.uid()) is null then raise exception 'authentication_required'; end if;
  select * into v_ticket from public.tickets where id=p_ticket_id for update;
  if not found or not private.user_is_company_member(v_ticket.company_id) then raise exception 'not_found_or_forbidden'; end if;
  if v_ticket.status <> 'closed' or v_ticket.final_cost is null or v_ticket.final_cost <= 0 then raise exception 'ticket_not_payable'; end if;

  select * into v_payment from public.payments
  where ticket_id=p_ticket_id and provider='transbank'
  order by created_at desc limit 1 for update;

  if not found then
    insert into public.payments(company_id,ticket_id,provider,idempotency_key,amount,currency_code,status,created_by)
    values(v_ticket.company_id,p_ticket_id,'transbank','tbk:'||p_ticket_id::text,v_ticket.final_cost,'CLP','pending',(select auth.uid()))
    returning * into v_payment;
  elsif v_payment.status in ('failed','cancelled') then
    update public.payments set status='pending',amount=v_ticket.final_cost,provider_reference=null,
      provider_buy_order=null,provider_redirect_url=null,authorized_at=null,captured_at=null
    where id=v_payment.id returning * into v_payment;
  end if;

  return query select v_payment.id,v_payment.amount,v_payment.currency_code;
end $$;

revoke all on function public.initialize_transbank_ticket_payment(uuid) from public,anon;
grant execute on function public.initialize_transbank_ticket_payment(uuid) to authenticated;
