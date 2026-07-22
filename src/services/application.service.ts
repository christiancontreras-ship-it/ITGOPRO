import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function listPublishedTickets() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .select(
      'id,code,title,description,priority,modality,estimated_cost,applications_close_at,ticket_categories(name)',
    )
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listOwnApplications() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('ticket_applications')
    .select('id,status,amount,currency_code,created_at,tickets(code,title)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listTicketCandidates(ticketId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('ticket_applications')
    .select(
      'id,status,amount,currency_code,estimated_hours,available_from,estimated_end_at,solution_summary,specialist_profiles(public_name,professional_title,rating_average,completed_services)',
    )
    .eq('ticket_id', ticketId)
    .neq('status', 'draft')
    .order('created_at')
  if (error) throw error
  return data ?? []
}
