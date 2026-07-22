create table public.monitoring_assets (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id), managed_service_id uuid references public.managed_services(id),
 name text not null, asset_type text not null check(asset_type in('server','database','firewall','website','cloud_service','certificate','backup')),
 external_id text, status text not null default 'unknown' check(status in('healthy','warning','critical','unknown','maintenance')),
 last_seen_at timestamptz, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(company_id,external_id)
);
create table public.monitoring_metrics (
 id bigint generated always as identity primary key, asset_id uuid not null references public.monitoring_assets(id) on delete cascade,
 metric_name text not null, metric_value numeric not null, unit text, observed_at timestamptz not null, created_at timestamptz not null default now(), unique(asset_id,metric_name,observed_at)
);
create table public.monitoring_alerts (
 id uuid primary key default gen_random_uuid(), asset_id uuid not null references public.monitoring_assets(id), external_alert_id text,
 severity text not null check(severity in('info','warning','high','critical')), title text not null, description text not null,
 status text not null default 'open' check(status in('open','acknowledged','resolved','suppressed')), ticket_id uuid references public.tickets(id),
 occurred_at timestamptz not null, resolved_at timestamptz, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(asset_id,external_alert_id)
);
create index monitoring_assets_company_idx on public.monitoring_assets(company_id,status);
create index monitoring_metrics_asset_time_idx on public.monitoring_metrics(asset_id,observed_at desc);
create index monitoring_alerts_asset_status_idx on public.monitoring_alerts(asset_id,status,occurred_at desc);
create trigger monitoring_assets_updated_at before update on public.monitoring_assets for each row execute function public.set_updated_at();
create trigger monitoring_alerts_updated_at before update on public.monitoring_alerts for each row execute function public.set_updated_at();
do $$ declare t text; begin foreach t in array array['monitoring_assets','monitoring_metrics','monitoring_alerts'] loop execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t); end loop; end $$;
create policy monitoring_assets_company_read on public.monitoring_assets for select to authenticated using((select private.user_is_company_member(company_id)));
create policy monitoring_metrics_company_read on public.monitoring_metrics for select to authenticated using(exists(select 1 from public.monitoring_assets a where a.id=asset_id));
create policy monitoring_alerts_company_read on public.monitoring_alerts for select to authenticated using(exists(select 1 from public.monitoring_assets a where a.id=asset_id));
grant select on public.monitoring_assets,public.monitoring_metrics,public.monitoring_alerts to authenticated;

create or replace function public.create_ticket_from_critical_alert(p_alert_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare v_alert public.monitoring_alerts; v_asset public.monitoring_assets; v_ticket uuid; v_category uuid; v_requester uuid;
begin
 select * into v_alert from public.monitoring_alerts where id=p_alert_id for update; if not found then raise exception 'alert_not_found'; end if;
 if v_alert.severity<>'critical' then raise exception 'alert_not_critical'; end if; if v_alert.ticket_id is not null then return v_alert.ticket_id; end if;
 select * into v_asset from public.monitoring_assets where id=v_alert.asset_id;
 select user_id into v_requester from public.company_memberships where company_id=v_asset.company_id and status='active' order by is_primary desc,created_at limit 1;
 select id into v_category from public.ticket_categories where code=case when v_asset.asset_type='database' then 'postgresql' when v_asset.asset_type='firewall' then 'firewall' else 'linux' end;
 insert into public.tickets(code,company_id,requester_id,category_id,title,description,priority,status,modality,published_at)
 values('',v_asset.company_id,v_requester,v_category,left('[MON] '||v_alert.title,160),left(v_alert.description,10000),'critical','published','remote',now()) returning id into v_ticket;
 update public.monitoring_alerts set ticket_id=v_ticket where id=p_alert_id; return v_ticket;
end $$;
revoke all on function public.create_ticket_from_critical_alert(uuid) from public,anon,authenticated;
grant execute on function public.create_ticket_from_critical_alert(uuid) to service_role;
