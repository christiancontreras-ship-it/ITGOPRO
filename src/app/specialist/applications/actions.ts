'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  assignmentResponseSchema,
  resolveAssignmentSchema,
  startAssignmentSchema,
} from '@/lib/validation/application'

export async function respondAssignmentAction(formData: FormData) {
  const parsed = assignmentResponseSchema.safeParse({
    assignmentId: formData.get('assignmentId'),
    decision: formData.get('decision'),
    reason: formData.get('reason') || undefined,
  })
  if (!parsed.success) throw new Error('Respuesta de asignación inválida.')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('respond_ticket_assignment', {
    p_assignment_id: parsed.data.assignmentId,
    p_accept: parsed.data.decision === 'accept',
    p_reason: parsed.data.reason,
  })
  if (error) throw new Error('No fue posible responder la asignación.')

  revalidatePath('/specialist')
  revalidatePath('/specialist/applications')
}

export async function startAssignmentAction(formData: FormData) {
  const parsed = startAssignmentSchema.safeParse({
    assignmentId: formData.get('assignmentId'),
  })
  if (!parsed.success) throw new Error('Asignación inválida.')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('start_ticket_work', {
    p_assignment_id: parsed.data.assignmentId,
  })
  if (error) throw new Error('No fue posible iniciar el trabajo.')

  revalidatePath('/specialist')
  revalidatePath('/specialist/applications')
}

export async function resolveAssignmentAction(formData: FormData) {
  const parsed = resolveAssignmentSchema.safeParse({
    ticketId: formData.get('ticketId'),
    resolutionSummary: formData.get('resolutionSummary'),
  })
  if (!parsed.success) throw new Error('El resumen de resolución es inválido.')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('resolve_ticket_work', {
    p_ticket_id: parsed.data.ticketId,
    p_resolution_summary: parsed.data.resolutionSummary,
  })
  if (error) throw new Error('No fue posible marcar el ticket como resuelto.')

  revalidatePath('/specialist')
  revalidatePath('/specialist/applications')
  revalidatePath(`/app/tickets/${parsed.data.ticketId}`)
}
