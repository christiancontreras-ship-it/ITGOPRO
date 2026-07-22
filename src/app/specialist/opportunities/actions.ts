'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  type ApplicationActionState,
  ticketApplicationSchema,
} from '@/lib/validation/application'

export async function submitApplicationAction(
  _state: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const parsed = ticketApplicationSchema.safeParse({
    ticketId: formData.get('ticketId'),
    billingType: formData.get('billingType'),
    amount: formData.get('amount'),
    estimatedHours: formData.get('estimatedHours') || undefined,
    availableFrom: formData.get('availableFrom'),
    estimatedEndAt: formData.get('estimatedEndAt'),
    modality: formData.get('modality'),
    solutionSummary: formData.get('solutionSummary'),
    assumptions: formData.get('assumptions') || undefined,
    exclusions: formData.get('exclusions') || undefined,
    warranty: formData.get('warranty') || undefined,
    validUntil: formData.get('validUntil'),
  })
  if (!parsed.success)
    return { status: 'error', message: parsed.error.issues[0]?.message }

  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user)
    return { status: 'error', message: 'Sesión no disponible.' }
  const { data: specialist } = await supabase
    .from('specialist_profiles')
    .select('id')
    .eq('user_id', userData.user.id)
    .single()
  if (!specialist)
    return { status: 'error', message: 'Debes tener un perfil aprobado.' }
  const value = parsed.data
  const { error } = await supabase.from('ticket_applications').insert({
    ticket_id: value.ticketId,
    specialist_id: specialist.id,
    status: 'submitted',
    billing_type: value.billingType,
    amount: value.amount,
    estimated_hours: value.estimatedHours,
    available_from: value.availableFrom.toISOString(),
    estimated_end_at: value.estimatedEndAt.toISOString(),
    modality: value.modality,
    solution_summary: value.solutionSummary,
    assumptions: value.assumptions,
    exclusions: value.exclusions,
    warranty: value.warranty,
    valid_until: value.validUntil.toISOString(),
    submitted_at: new Date().toISOString(),
  })
  if (error) return { status: 'error', message: error.message }
  revalidatePath('/specialist/opportunities')
  return { status: 'success', message: 'Propuesta enviada.' }
}
