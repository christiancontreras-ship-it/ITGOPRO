'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  closeTicketSchema,
  createTicketSchema,
  publishTicketSchema,
  type TicketActionState,
  ticketCommentSchema,
  ticketReviewSchema,
} from '@/lib/validation/ticket'

export async function createTicketAction(
  _state: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const parsed = createTicketSchema.safeParse({
    companyId: formData.get('companyId'),
    categoryId: formData.get('categoryId'),
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    modality: formData.get('modality'),
  })
  if (!parsed.success)
    return { status: 'error', message: 'Revisa los datos del ticket.' }
  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) redirect('/auth/login')
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      company_id: parsed.data.companyId,
      requester_id: claims.claims.sub,
      category_id: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      modality: parsed.data.modality,
      code: '',
    })
    .select('id')
    .single()
  if (error || !data)
    return { status: 'error', message: 'No fue posible crear el ticket.' }
  redirect(`/app/tickets/${data.id}`)
}

export async function addTicketCommentAction(formData: FormData) {
  const parsed = ticketCommentSchema.safeParse({
    ticketId: formData.get('ticketId'),
    body: formData.get('body'),
  })
  if (!parsed.success) return
  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) redirect('/auth/login')
  await supabase.from('ticket_comments').insert({
    ticket_id: parsed.data.ticketId,
    author_id: claims.claims.sub,
    body: parsed.data.body,
  })
  revalidatePath(`/app/tickets/${parsed.data.ticketId}`)
}

export async function publishTicketAction(formData: FormData) {
  const parsed = publishTicketSchema.safeParse({
    ticketId: formData.get('ticketId'),
  })
  if (!parsed.success) redirect('/app/tickets')

  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) redirect('/auth/login')

  const publishedAt = new Date()
  const applicationsCloseAt = new Date(
    publishedAt.getTime() + 7 * 24 * 60 * 60 * 1000,
  )
  const { data, error } = await supabase
    .from('tickets')
    .update({
      status: 'published',
      published_at: publishedAt.toISOString(),
      applications_close_at: applicationsCloseAt.toISOString(),
    })
    .eq('id', parsed.data.ticketId)
    .eq('status', 'new')
    .is('deleted_at', null)
    .select('id')
    .maybeSingle()

  if (error || !data)
    redirect(`/app/tickets/${parsed.data.ticketId}?error=publish`)

  revalidatePath('/app')
  revalidatePath('/app/tickets')
  revalidatePath(`/app/tickets/${parsed.data.ticketId}`)
  redirect(`/app/tickets/${parsed.data.ticketId}`)
}

export async function closeTicketAction(formData: FormData) {
  const parsed = closeTicketSchema.safeParse({
    ticketId: formData.get('ticketId'),
  })
  if (!parsed.success) redirect('/app/tickets')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('close_resolved_ticket', {
    p_ticket_id: parsed.data.ticketId,
  })
  if (error) redirect(`/app/tickets/${parsed.data.ticketId}?error=close`)

  revalidatePath('/app')
  revalidatePath('/app/tickets')
  revalidatePath(`/app/tickets/${parsed.data.ticketId}`)
  redirect(`/app/tickets/${parsed.data.ticketId}`)
}

export async function submitTicketReviewAction(formData: FormData) {
  const parsed = ticketReviewSchema.safeParse({
    ticketId: formData.get('ticketId'),
    rating: formData.get('rating'),
    technicalRating: formData.get('technicalRating'),
    communicationRating: formData.get('communicationRating'),
    comment: formData.get('comment') ?? '',
    isPublic: formData.get('isPublic') === 'on',
  })
  if (!parsed.success) redirect('/app/tickets')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('submit_ticket_review', {
    p_ticket_id: parsed.data.ticketId,
    p_rating: parsed.data.rating,
    p_technical_rating: parsed.data.technicalRating,
    p_communication_rating: parsed.data.communicationRating,
    p_comment: parsed.data.comment || undefined,
    p_is_public: parsed.data.isPublic,
  })
  if (error) redirect(`/app/tickets/${parsed.data.ticketId}?error=review`)

  revalidatePath('/app')
  revalidatePath('/app/marketplace')
  revalidatePath(`/app/tickets/${parsed.data.ticketId}`)
  redirect(`/app/tickets/${parsed.data.ticketId}?review=success`)
}
