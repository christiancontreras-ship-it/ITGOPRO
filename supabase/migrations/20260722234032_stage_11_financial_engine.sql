create table public.plans (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, audience text not null check(audience in('company','specialist')),
 price numeric(14,2) not null default 0 check(price>=0), currency_code text not null default 'CLP' references public.currencies(code),
 commission_percent numeric(5,2) not null check(commission_percent between 0 and 100), features jsonb not null default '{}'::jsonb, is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), ticket_id uuid references public.tickets(id),
 provider text not null check(provider in('mercado_pago','transbank','manual')), provider_reference text,
 idempotency_key text not null unique, amount numeric(14,2) not null check(amount>0), currency_code text not null default 'CLP' references public.currencies(code),
 status text not null default 'pending' check(status in('pending','authorized','captured','failed','refunded','cancelled','disputed')),
 created_by uuid not null references public.profiles(id), authorized_at timestamptz, captured_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.commissions (
 id uuid primary key default gen_random_uuid(), payment_id uuid not null unique references public.payments(id), specialist_id uuid not null references public.specialist_profiles(id),
 gross_amount numeric(14,2) not null, commission_percent numeric(5,2) not null, platform_amount numeric(14,2) not null, specialist_amount numeric(14,2) not null,
 status text not null default 'pending' check(status in('pending','available','paid','held','reversed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(platform_amount+specialist_amount=gross_amount)
);
create table public.financial_accounts (
 id uuid primary key default gen_random_uuid(), owner_type text not null check(owner_type in('platform','company','specialist')), owner_id uuid,
 account_type text not null check(account_type in('cash','payable','revenue','clearing')), currency_code text not null default 'CLP' references public.currencies(code),
 created_at timestamptz not null default now(), unique(owner_type,owner_id,account_type,currency_code)
);
create table public.ledger_transactions (
 id uuid primary key default gen_random_uuid(), payment_id uuid not null unique references public.payments(id), description text not null,
 created_by uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create table public.ledger_entries (
 id uuid primary key default gen_random_uuid(), transaction_id uuid not null references public.ledger_transactions(id), account_id uuid not null references public.financial_accounts(id),
 direction text not null check(direction in('debit','credit')), amount numeric(14,2) not null check(amount>0), currency_code text not null references public.currencies(code), created_at timestamptz not null default now()
);
create index payments_company_created_idx on public.payments(company_id,created_at desc);
create index ledger_entries_transaction_idx on public.ledger_entries(transaction_id);
create trigger plans_updated_at before update on public.plans for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger commissions_updated_at before update on public.commissions for each row execute function public.set_updated_at();
do $$ declare t text; begin foreach t in array array['plans','payments','commissions','financial_accounts','ledger_transactions','ledger_entries'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy plans_read on public.plans for select to authenticated using(is_active);
create policy payments_company_read on public.payments for select to authenticated using((select private.user_is_company_member(company_id)));
create policy commissions_participant_read on public.commissions for select to authenticated using(exists(select 1 from public.payments p where p.id=payment_id and (select private.user_is_company_member(p.company_id))) or exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
grant select on public.plans,public.payments,public.commissions to authenticated;

create or replace function public.create_manual_ticket_payment(p_ticket_id uuid,p_amount numeric,p_idempotency_key text,p_commission_percent numeric default 20)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_ticket public.tickets; v_payment uuid; v_specialist uuid; v_tx uuid; v_cash uuid; v_revenue uuid; v_payable uuid; v_platform numeric; v_specialist_amount numeric;
begin
 select * into v_ticket from public.tickets where id=p_ticket_id for update;
 if not found or not private.user_is_company_member(v_ticket.company_id) then raise exception 'not_found_or_forbidden'; end if;
 if p_amount<=0 or p_commission_percent<0 or p_commission_percent>100 then raise exception 'invalid_financial_values'; end if;
 v_specialist:=v_ticket.assigned_specialist_id; if v_specialist is null then raise exception 'ticket_without_specialist'; end if;
 select id into v_payment from public.payments where idempotency_key=p_idempotency_key;
 if found then return v_payment; end if;
 v_platform:=round(p_amount*p_commission_percent/100,2); v_specialist_amount:=p_amount-v_platform;
 insert into public.payments(company_id,ticket_id,provider,idempotency_key,amount,status,created_by,captured_at) values(v_ticket.company_id,p_ticket_id,'manual',p_idempotency_key,p_amount,'captured',(select auth.uid()),now()) returning id into v_payment;
 insert into public.commissions(payment_id,specialist_id,gross_amount,commission_percent,platform_amount,specialist_amount,status) values(v_payment,v_specialist,p_amount,p_commission_percent,v_platform,v_specialist_amount,'available');
 select id into v_cash from public.financial_accounts where owner_type='platform' and owner_id is null and account_type='cash' and currency_code='CLP';
 if v_cash is null then insert into public.financial_accounts(owner_type,owner_id,account_type) values('platform',null,'cash') returning id into v_cash; end if;
 select id into v_revenue from public.financial_accounts where owner_type='platform' and owner_id is null and account_type='revenue' and currency_code='CLP';
 if v_revenue is null then insert into public.financial_accounts(owner_type,owner_id,account_type) values('platform',null,'revenue') returning id into v_revenue; end if;
 insert into public.financial_accounts(owner_type,owner_id,account_type) values('specialist',v_specialist,'payable') on conflict(owner_type,owner_id,account_type,currency_code) do update set owner_type=excluded.owner_type returning id into v_payable;
 insert into public.ledger_transactions(payment_id,description,created_by) values(v_payment,'Captura de pago de ticket',(select auth.uid())) returning id into v_tx;
 insert into public.ledger_entries(transaction_id,account_id,direction,amount,currency_code) values(v_tx,v_cash,'debit',p_amount,'CLP'),(v_tx,v_revenue,'credit',v_platform,'CLP'),(v_tx,v_payable,'credit',v_specialist_amount,'CLP');
 return v_payment;
end $$;
revoke all on function public.create_manual_ticket_payment(uuid,numeric,text,numeric) from public,anon;
grant execute on function public.create_manual_ticket_payment(uuid,numeric,text,numeric) to authenticated;

insert into public.plans(code,name,audience,price,commission_percent) values
('company_free','Free','company',0,20),('company_business','Business','company',29990,15),('company_corporate','Corporate','company',99990,10),
('specialist_free','Free','specialist',0,20),('specialist_pro','Pro','specialist',14990,15),('specialist_elite','Elite','specialist',29990,10);
