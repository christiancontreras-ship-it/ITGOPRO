'use server'

import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  createCheckoutPreference,
  findMercadoPagoPayments,
} from '@/services/mercadopago.service'
import {
  createWebpayTransaction,
  getWebpayTransactionStatus,
} from '@/services/transbank.service'

export async function startTransbankCheckoutAction(formData: FormData) {
  const ticketId = String(formData.get('ticketId') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(ticketId))
    redirect('/app/billing?payment=invalid')
  const supabase = await createSupabaseServerClient()
  const { data: payment, error } = await supabase
    .rpc('initialize_transbank_ticket_payment', { p_ticket_id: ticketId })
    .single()
  if (error || !payment) redirect('/app/billing?payment=unavailable')

  try {
    const session = await createWebpayTransaction({
      paymentId: payment.payment_id,
      amount: Number(payment.amount),
    })
    const admin = createSupabaseAdminClient()
    const { error: updateError } = await admin
      .from('payments')
      .update({
        provider_reference: session.token,
        provider_buy_order: session.buyOrder,
        provider_redirect_url: session.url,
      })
      .eq('id', payment.payment_id)
      .eq('provider', 'transbank')
    if (updateError) throw updateError
    redirect(`/api/payments/transbank/redirect?paymentId=${payment.payment_id}`)
  } catch (checkoutError) {
    if (
      checkoutError &&
      typeof checkoutError === 'object' &&
      'digest' in checkoutError
    )
      throw checkoutError
    console.error('[transbank:create] failed', {
      paymentId: payment.payment_id,
      error:
        checkoutError instanceof Error
          ? checkoutError.message
          : 'unknown_error',
    })
    redirect('/app/billing?payment=transbank_provider_error')
  }
}

export async function reconcileTransbankPaymentAction(formData: FormData) {
  const paymentId = String(formData.get('paymentId') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(paymentId))
    redirect('/app/billing?payment=invalid')
  const supabase = await createSupabaseServerClient()
  const { data: payment, error } = await supabase
    .from('payments')
    .select('id,amount,status,provider,provider_reference,provider_buy_order')
    .eq('id', paymentId)
    .eq('provider', 'transbank')
    .single()
  if (error || !payment?.provider_reference || !payment.provider_buy_order)
    redirect('/app/billing?payment=unavailable')
  if (payment.status === 'captured') redirect('/app/billing?payment=success')
  try {
    const status = await getWebpayTransactionStatus(payment.provider_reference)
    const admin = createSupabaseAdminClient()
    const { error: finalizeError } = await admin.rpc(
      'finalize_transbank_ticket_payment',
      {
        p_payment_id: payment.id,
        p_provider_reference: payment.provider_reference,
        p_buy_order: status.buy_order,
        p_amount: status.amount,
        p_provider_status: status.status,
        p_response_code: status.response_code,
      },
    )
    if (finalizeError) throw finalizeError
    redirect(
      `/app/billing?payment=${status.status === 'AUTHORIZED' && status.response_code === 0 ? 'success' : 'failed'}`,
    )
  } catch (reconcileError) {
    if (
      reconcileError &&
      typeof reconcileError === 'object' &&
      'digest' in reconcileError
    )
      throw reconcileError
    console.error('[transbank:reconcile] failed', {
      paymentId,
      error:
        reconcileError instanceof Error
          ? reconcileError.message
          : 'unknown_error',
    })
    redirect('/app/billing?payment=transbank_verification_error')
  }
}

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
