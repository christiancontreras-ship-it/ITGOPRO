'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function selectCandidateAction(formData: FormData) {
  const ticketId = String(formData.get('ticketId'))
  const applicationId = String(formData.get('applicationId'))
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('select_ticket_candidate', {
    p_application_id: applicationId,
    p_ticket_id: ticketId,
  })
  if (error) throw error
  revalidatePath(`/app/tickets/${ticketId}/candidates`)
}
