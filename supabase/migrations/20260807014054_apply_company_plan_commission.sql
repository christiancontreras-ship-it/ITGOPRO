create or replace function private.apply_company_plan_commission()
returns trigger language plpgsql security invoker set search_path='' as $$
declare v_company uuid; v_percent numeric;
begin
  select p.company_id into v_company from public.payments p where p.id=new.payment_id;
  if v_company is null then return new; end if;
  v_percent:=private.company_commission_percent(v_company);
  new.commission_percent:=v_percent;
  new.platform_amount:=round(new.gross_amount*v_percent/100,2);
  new.specialist_amount:=new.gross_amount-new.platform_amount;
  return new;
end $$;

create trigger commissions_apply_company_plan before insert on public.commissions
for each row execute function private.apply_company_plan_commission();
