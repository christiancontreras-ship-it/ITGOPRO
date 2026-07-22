'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function sendTicketMessageAction(formData: FormData) {
  const ticketId = String(formData.get('ticketId'))
  const body = String(formData.get('body')).trim()
  if (!ticketId || body.length < 1 || body.length > 5000)
    return { error: 'Mensaje inválido.' }
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return { error: 'Sesión no disponible.' }
  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: data.user.id,
    body,
    visibility: 'participants',
  })
  return error ? { error: error.message } : { success: true }
}
