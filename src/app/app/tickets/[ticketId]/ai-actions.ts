'use server'

import { revalidatePath } from 'next/cache'
import { analyzeTicketWithClaude } from '@/services/claude.service'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function analyzeTicketAction(formData: FormData) {
  const ticketId = String(formData.get('ticketId'))
  const supabase = await createSupabaseServerClient()
  const [{ data: auth }, { data: ticket }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('tickets')
      .select('title,description,priority,modality')
      .eq('id', ticketId)
      .single(),
  ])
  if (!auth.user || !ticket) throw new Error('Ticket no disponible.')
  const result = await analyzeTicketWithClaude(ticket)
  const { error } = await supabase.from('ticket_ai_analyses').insert({
    ticket_id: ticketId,
    requested_by: auth.user.id,
    model: result.model,
    prompt_version: 'ticket-analysis-v1',
    category_code: result.categoryCode,
    suggested_priority: result.suggestedPriority,
    complexity: result.complexity,
    estimated_hours: result.estimatedHours,
    estimated_cost: result.estimatedCost,
    technical_summary: result.technicalSummary,
    recommended_actions: result.recommendedActions,
    risk_flags: result.riskFlags,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
  })
  if (error) throw error
  revalidatePath(`/app/tickets/${ticketId}`)
}
