'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createCheckoutPreference } from '@/services/mercadopago.service'

export async function startMercadoPagoCheckoutAction(formData: FormData) {
  const ticketId = String(formData.get('ticketId') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(ticketId))
    redirect('/app/billing?payment=invalid')

  const supabase = await createSupabaseServerClient()
  const { data: payment, error } = await supabase
    .rpc('initialize_mercadopago_ticket_payment', { p_ticket_id: ticketId })
    .single()
  if (error || !payment) redirect('/app/billing?payment=unavailable')

  const { data: ticket } = await supabase
    .from('tickets')
    .select('code,title')
    .eq('id', ticketId)
    .single()
  if (!ticket) redirect('/app/billing?payment=unavailable')

  try {
    const preference = await createCheckoutPreference({
      paymentId: payment.payment_id,
      ticketCode: ticket.code,
      title: ticket.title,
      amount: Number(payment.amount),
    })
    const checkoutUrl =
      process.env.MERCADOPAGO_MODE === 'test'
        ? preference.sandbox_init_point
        : preference.init_point
    redirect(checkoutUrl)
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error
    redirect('/app/billing?payment=provider_error')
  }
}
