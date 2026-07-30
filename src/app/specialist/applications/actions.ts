'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  assignmentResponseSchema,
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
