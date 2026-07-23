create table public.analytics_daily_company_metrics (
 company_id uuid not null references public.companies(id), metric_date date not null,
 tickets_created integer not null default 0, tickets_closed integer not null default 0, critical_tickets integer not null default 0,
 payments_captured numeric(16,2) not null default 0, platform_commission numeric(16,2) not null default 0,
 active_managed_services integer not null default 0, open_alerts integer not null default 0, refreshed_at timestamptz not null default now(),
 primary key(company_id,metric_date)
);
create table public.analytics_goals (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), metric_code text not null,
 period_start date not null, period_end date not null, target_value numeric not null, created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(period_end>=period_start), unique(company_id,metric_code,period_start,period_end)
);
create table public.analytics_api_keys (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), name text not null, key_hash text not null unique,
 scopes text[] not null default array['analytics:read'], last_used_at timestamptz, expires_at timestamptz, revoked_at timestamptz,
 created_by uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create index analytics_metrics_date_idx on public.analytics_daily_company_metrics(metric_date desc,company_id);
create trigger analytics_goals_updated_at before update on public.analytics_goals for each row execute function public.set_updated_at();
do $$ declare t text; begin foreach t in array array['analytics_daily_company_metrics','analytics_goals','analytics_api_keys'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy analytics_metrics_company_read on public.analytics_daily_company_metrics for select to authenticated using((select private.user_is_company_member(company_id)));
create policy analytics_goals_company_read on public.analytics_goals for select to authenticated using((select private.user_is_company_member(company_id)));
create policy analytics_goals_company_write on public.analytics_goals for all to authenticated using((select private.user_is_company_member(company_id))) with check(created_by=(select auth.uid()) and (select private.user_is_company_member(company_id)));
grant select on public.analytics_daily_company_metrics,public.analytics_goals to authenticated; grant insert,update,delete on public.analytics_goals to authenticated;

create or replace function public.refresh_company_daily_metrics(p_company_id uuid,p_date date default current_date) returns void language plpgsql security definer set search_path='' as $$
begin
 if coalesce((select auth.jwt()->>'role'),'')<>'service_role' and not private.user_is_company_member(p_company_id) then raise exception 'not_found_or_forbidden'; end if;
 insert into public.analytics_daily_company_metrics(company_id,metric_date,tickets_created,tickets_closed,critical_tickets,payments_captured,platform_commission,active_managed_services,open_alerts,refreshed_at)
 select p_company_id,p_date,
 (select count(*) from public.tickets where company_id=p_company_id and created_at::date=p_date),
 (select count(*) from public.tickets where company_id=p_company_id and closed_at::date=p_date),
 (select count(*) from public.tickets where company_id=p_company_id and priority='critical' and created_at::date=p_date),
 coalesce((select sum(amount) from public.payments where company_id=p_company_id and status='captured' and captured_at::date=p_date),0),
 coalesce((select sum(c.platform_amount) from public.commissions c join public.payments p on p.id=c.payment_id where p.company_id=p_company_id and p.captured_at::date=p_date),0),
 (select count(*) from public.managed_services where company_id=p_company_id and status='active'),
 (select count(*) from public.monitoring_alerts ma join public.monitoring_assets a on a.id=ma.asset_id where a.company_id=p_company_id and ma.status='open'),now()
 on conflict(company_id,metric_date) do update set tickets_created=excluded.tickets_created,tickets_closed=excluded.tickets_closed,critical_tickets=excluded.critical_tickets,payments_captured=excluded.payments_captured,platform_commission=excluded.platform_commission,active_managed_services=excluded.active_managed_services,open_alerts=excluded.open_alerts,refreshed_at=now();
end $$;
revoke all on function public.refresh_company_daily_metrics(uuid,date) from public,anon; grant execute on function public.refresh_company_daily_metrics(uuid,date) to authenticated,service_role;
