create table public.ticket_messages (
 id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.tickets(id) on delete cascade,
 sender_id uuid not null references public.profiles(id), body text not null check(char_length(body) between 1 and 5000),
 visibility text not null default 'participants' check(visibility in('participants','company_internal')),
 message_type text not null default 'text' check(message_type in('text','system','file')),
 reply_to_id uuid references public.ticket_messages(id), metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), edited_at timestamptz, deleted_at timestamptz
);
create index ticket_messages_ticket_created_idx on public.ticket_messages(ticket_id,created_at) where deleted_at is null;
create index ticket_messages_sender_idx on public.ticket_messages(sender_id,created_at desc);

alter table public.ticket_messages enable row level security;
alter table public.ticket_messages force row level security;

create policy ticket_messages_read on public.ticket_messages for select to authenticated using(
 exists(select 1 from public.tickets t where t.id=ticket_id and (
   (select private.user_is_company_member(t.company_id))
   or (visibility='participants' and exists(select 1 from public.specialist_profiles s where s.id=t.assigned_specialist_id and s.user_id=(select auth.uid())))
 ))
);
create policy ticket_messages_insert on public.ticket_messages for insert to authenticated with check(
 sender_id=(select auth.uid()) and exists(select 1 from public.tickets t where t.id=ticket_id and t.status in('assigned','in_progress','waiting_customer','resolved') and (
   (select private.user_is_company_member(t.company_id))
   or (visibility='participants' and exists(select 1 from public.specialist_profiles s where s.id=t.assigned_specialist_id and s.user_id=(select auth.uid())))
 ))
);

grant select,insert on public.ticket_messages to authenticated;

do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='ticket_messages') then
   alter publication supabase_realtime add table public.ticket_messages;
 end if;
end $$;
