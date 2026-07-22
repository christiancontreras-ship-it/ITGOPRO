import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getTicketDashboard(companyId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .select(
      'id,code,title,status,priority,created_at,resolution_due_at,ticket_categories(name)',
    )
    .eq('company_id', companyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  const tickets = data ?? []
  return {
    tickets,
    open: tickets.filter(
      (t) => !['resolved', 'closed', 'cancelled'].includes(t.status),
    ).length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    critical: tickets.filter(
      (t) =>
        t.priority === 'critical' &&
        !['closed', 'cancelled'].includes(t.status),
    ).length,
  }
}

export async function getTicket(ticketId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .select(
      '*,ticket_categories(name),ticket_status_history(*),ticket_comments(*),ticket_messages(id,body,sender_id,created_at),ticket_ai_analyses(*)',
    )
    .eq('id', ticketId)
    .single()
  if (error) return null
  return data
}

export async function getTicketCategories() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('ticket_categories')
    .select('id,code,name')
    .eq('is_active', true)
    .order('sort_order')
  return data ?? []
}
