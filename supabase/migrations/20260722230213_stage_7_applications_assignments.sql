alter table public.tickets add column if not exists applications_close_at timestamptz;
alter table public.tickets add column if not exists assigned_specialist_id uuid references public.specialist_profiles(id);
alter table public.tickets add column if not exists work_started_at timestamptz;

create table public.ticket_applications (
 id uuid primary key default gen_random_uuid(),
 ticket_id uuid not null references public.tickets(id) on delete cascade,
 specialist_id uuid not null references public.specialist_profiles(id) on delete cascade,
 status text not null default 'draft' check(status in('draft','submitted','under_review','shortlisted','revision_requested','accepted','rejected','withdrawn','expired')),
 billing_type text not null check(billing_type in('fixed','hourly','daily','monthly')),
 amount numeric(14,2) not null check(amount>0), currency_code text not null default 'CLP' references public.currencies(code),
 estimated_hours numeric(8,2) check(estimated_hours is null or estimated_hours>0),
 available_from timestamptz not null, estimated_end_at timestamptz not null,
 modality text not null check(modality in('remote','onsite','hybrid')),
 solution_summary text not null check(char_length(solution_summary) between 40 and 5000),
 assumptions text, exclusions text, warranty text,
 valid_until timestamptz not null, version integer not null default 1 check(version>0),
 submitted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(estimated_end_at>available_from), check(valid_until>created_at)
);
create unique index ticket_applications_active_unique on public.ticket_applications(ticket_id,specialist_id)
 where status in('draft','submitted','under_review','shortlisted','revision_requested','accepted');

create table public.ticket_application_versions (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.ticket_applications(id) on delete cascade,
 version integer not null, snapshot jsonb not null, created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(), unique(application_id,version)
);
create table public.ticket_application_messages (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.ticket_applications(id) on delete cascade,
 sender_id uuid not null references public.profiles(id), body text not null check(char_length(body) between 1 and 3000),
 created_at timestamptz not null default now()
);
create table public.ticket_assignments (
 id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
 application_id uuid not null references public.ticket_applications(id),
 specialist_id uuid not null references public.specialist_profiles(id),
 status text not null default 'pending_acceptance' check(status in('pending_acceptance','accepted','rejected','cancelled','started','completed')),
 selected_by uuid not null references public.profiles(id), expires_at timestamptz not null,
 accepted_at timestamptz, rejected_at timestamptz, rejection_reason text, started_at timestamptz, completed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index ticket_assignments_active_unique on public.ticket_assignments(ticket_id)
 where status in('pending_acceptance','accepted','started');
create index ticket_applications_ticket_idx on public.ticket_applications(ticket_id,status,created_at desc);
create index ticket_applications_specialist_idx on public.ticket_applications(specialist_id,status,created_at desc);
create index ticket_assignments_specialist_idx on public.ticket_assignments(specialist_id,status);

create trigger ticket_applications_updated_at before update on public.ticket_applications for each row execute function public.set_updated_at();
create trigger ticket_assignments_updated_at before update on public.ticket_assignments for each row execute function public.set_updated_at();

alter table public.ticket_applications enable row level security;
alter table public.ticket_application_versions enable row level security;
alter table public.ticket_application_messages enable row level security;
alter table public.ticket_assignments enable row level security;
alter table public.ticket_applications force row level security;
alter table public.ticket_application_versions force row level security;
alter table public.ticket_application_messages force row level security;
alter table public.ticket_assignments force row level security;

create policy tickets_published_specialist_read on public.tickets for select to authenticated using(
 status='published' and exists(select 1 from public.specialist_profiles s where s.user_id=(select auth.uid()) and s.approval_status='approved' and s.deleted_at is null)
);
create policy tickets_assigned_specialist_read on public.tickets for select to authenticated using(
 assigned_specialist_id is not null and exists(select 1 from public.specialist_profiles s where s.id=assigned_specialist_id and s.user_id=(select auth.uid()))
);
create policy applications_participant_read on public.ticket_applications for select to authenticated using(
 exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))
 or exists(select 1 from public.tickets t where t.id=ticket_id and (select private.user_is_company_member(t.company_id)))
);
create policy applications_specialist_insert on public.ticket_applications for insert to authenticated with check(
 exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()) and s.approval_status='approved')
 and exists(select 1 from public.tickets t where t.id=ticket_id and t.status='published' and (t.applications_close_at is null or t.applications_close_at>now()))
);
create policy applications_specialist_update on public.ticket_applications for update to authenticated using(
 exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))
) with check(exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid())));
create policy application_versions_participant_read on public.ticket_application_versions for select to authenticated using(
 exists(select 1 from public.ticket_applications a where a.id=application_id)
);
create policy application_messages_participant_read on public.ticket_application_messages for select to authenticated using(
 exists(select 1 from public.ticket_applications a where a.id=application_id)
);
create policy application_messages_participant_insert on public.ticket_application_messages for insert to authenticated with check(
 sender_id=(select auth.uid()) and exists(select 1 from public.ticket_applications a where a.id=application_id)
);
create policy assignments_participant_read on public.ticket_assignments for select to authenticated using(
 exists(select 1 from public.specialist_profiles s where s.id=specialist_id and s.user_id=(select auth.uid()))
 or exists(select 1 from public.tickets t where t.id=ticket_id and (select private.user_is_company_member(t.company_id)))
);

grant select,insert,update on public.ticket_applications to authenticated;
grant select on public.ticket_application_versions to authenticated;
grant select,insert on public.ticket_application_messages to authenticated;
grant select on public.ticket_assignments to authenticated;

create or replace function public.select_ticket_candidate(p_ticket_id uuid,p_application_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_application public.ticket_applications; v_ticket public.tickets; v_assignment_id uuid;
begin
 select * into v_ticket from public.tickets where id=p_ticket_id for update;
 if not found or not private.user_is_company_member(v_ticket.company_id) then raise exception 'not_found_or_forbidden'; end if;
 if v_ticket.status<>'published' then raise exception 'ticket_not_available'; end if;
 if exists(select 1 from public.ticket_assignments where ticket_id=p_ticket_id and status in('pending_acceptance','accepted','started')) then raise exception 'ticket_already_assigned'; end if;
 select * into v_application from public.ticket_applications where id=p_application_id and ticket_id=p_ticket_id and status in('submitted','under_review','shortlisted') and valid_until>now() for update;
 if not found then raise exception 'application_not_available'; end if;
 update public.ticket_applications set status=case when id=p_application_id then 'accepted' else 'rejected' end where ticket_id=p_ticket_id and status in('submitted','under_review','shortlisted','revision_requested');
 insert into public.ticket_assignments(ticket_id,application_id,specialist_id,selected_by,expires_at)
 values(p_ticket_id,p_application_id,v_application.specialist_id,(select auth.uid()),now()+interval '24 hours') returning id into v_assignment_id;
 update public.tickets set status='waiting_specialist',assigned_specialist_id=v_application.specialist_id where id=p_ticket_id;
 insert into public.audit_events(event_type,actor_user_id,company_id,entity_type,entity_id,action,outcome,metadata)
 values('ticket.assignment.selected',(select auth.uid()),v_ticket.company_id,'ticket_assignment',v_assignment_id,'select','success','{}');
 return v_assignment_id;
end $$;

create or replace function public.respond_ticket_assignment(p_assignment_id uuid,p_accept boolean,p_reason text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_assignment public.ticket_assignments;
begin
 select * into v_assignment from public.ticket_assignments where id=p_assignment_id for update;
 if not found or not exists(select 1 from public.specialist_profiles s where s.id=v_assignment.specialist_id and s.user_id=(select auth.uid())) then raise exception 'not_found_or_forbidden'; end if;
 if v_assignment.status<>'pending_acceptance' or v_assignment.expires_at<=now() then raise exception 'assignment_not_available'; end if;
 perform 1 from public.tickets where id=v_assignment.ticket_id for update;
 if p_accept then
  update public.ticket_assignments set status='accepted',accepted_at=now() where id=p_assignment_id;
  update public.tickets set status='assigned' where id=v_assignment.ticket_id;
 else
  update public.ticket_assignments set status='rejected',rejected_at=now(),rejection_reason=left(coalesce(p_reason,'Sin motivo'),1000) where id=p_assignment_id;
  update public.tickets set status='published',assigned_specialist_id=null where id=v_assignment.ticket_id;
 end if;
end $$;

create or replace function public.start_ticket_work(p_assignment_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_assignment public.ticket_assignments;
begin
 select * into v_assignment from public.ticket_assignments where id=p_assignment_id for update;
 if not found or v_assignment.status<>'accepted' or not exists(select 1 from public.specialist_profiles s where s.id=v_assignment.specialist_id and s.user_id=(select auth.uid())) then raise exception 'assignment_not_available'; end if;
 update public.ticket_assignments set status='started',started_at=now() where id=p_assignment_id;
 update public.tickets set status='in_progress',work_started_at=now() where id=v_assignment.ticket_id and status='assigned';
end $$;

revoke all on function public.select_ticket_candidate(uuid,uuid) from public,anon;
revoke all on function public.respond_ticket_assignment(uuid,boolean,text) from public,anon;
revoke all on function public.start_ticket_work(uuid) from public,anon;
grant execute on function public.select_ticket_candidate(uuid,uuid) to authenticated;
grant execute on function public.respond_ticket_assignment(uuid,boolean,text) to authenticated;
grant execute on function public.start_ticket_work(uuid) to authenticated;
