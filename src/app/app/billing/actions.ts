'use server'

import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  createCheckoutPreference,
  findMercadoPagoPayments,
} from '@/services/mercadopago.service'

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
    // Checkout Pro test payments are isolated by the test credentials and users.
    // The legacy sandbox URL can enter a redirect loop during buyer authentication.
    const checkoutUrl = preference.init_point
    redirect(checkoutUrl)
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error
    console.error(
      error instanceof Error
        ? error.message.replace(/^.*message=/, '')
        : 'Mercado Pago request failed: unknown provider error',
    )
    redirect('/app/billing?payment=provider_error')
  }
}

export async function reconcileMercadoPagoPaymentAction(formData: FormData) {
  const paymentId = String(formData.get('paymentId') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(paymentId))
    redirect('/app/billing?payment=invalid')

  const supabase = await createSupabaseServerClient()
  const { data: payment, error } = await supabase
    .from('payments')
    .select('id,amount,status,provider')
    .eq('id', paymentId)
    .eq('provider', 'mercado_pago')
    .single()
  if (error || !payment) redirect('/app/billing?payment=unavailable')
  if (payment.status === 'captured') redirect('/app/billing?payment=success')

  try {
    const providerPayments = await findMercadoPagoPayments(payment.id)
    const providerPayment = providerPayments.results.find(
      (candidate) =>
        candidate.external_reference === payment.id &&
        candidate.status === 'approved' &&
        Number(candidate.transaction_amount) === Number(payment.amount),
    )
    if (!providerPayment) redirect('/app/billing?payment=pending')

    const admin = createSupabaseAdminClient()
    const { error: finalizeError } = await admin.rpc(
      'finalize_mercadopago_ticket_payment',
      {
        p_payment_id: payment.id,
        p_provider_reference: String(providerPayment.id),
        p_amount: providerPayment.transaction_amount,
        p_provider_status: providerPayment.status,
      },
    )
    if (finalizeError) throw finalizeError
    redirect('/app/billing?payment=success')
  } catch (reconciliationError) {
    if (
      reconciliationError &&
      typeof reconciliationError === 'object' &&
      'digest' in reconciliationError
    )
      throw reconciliationError
    console.error('[mercadopago:reconcile] failed', {
      paymentId,
      error:
        reconciliationError instanceof Error
          ? reconciliationError.message
          : 'unknown_error',
    })
    redirect('/app/billing?payment=verification_error')
  }
}
