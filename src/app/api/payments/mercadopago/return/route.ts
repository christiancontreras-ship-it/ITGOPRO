import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getMercadoPagoPayment } from '@/services/mercadopago.service'

export async function GET(request: NextRequest) {
  const providerPaymentId = request.nextUrl.searchParams.get('payment_id')
  const destination = new URL('/app/billing', request.url)
  if (!providerPaymentId) {
    destination.searchParams.set('payment', 'cancelled')
    return NextResponse.redirect(destination)
  }

  try {
    const providerPayment = await getMercadoPagoPayment(providerPaymentId)
    if (!providerPayment.external_reference)
      throw new Error('Referencia externa ausente')
    const admin = createSupabaseAdminClient()
    const { error } = await admin.rpc('finalize_mercadopago_ticket_payment', {
      p_payment_id: providerPayment.external_reference,
      p_provider_reference: String(providerPayment.id),
      p_amount: providerPayment.transaction_amount,
      p_provider_status: providerPayment.status,
    })
    if (error) throw error
    destination.searchParams.set(
      'payment',
      providerPayment.status === 'approved'
        ? 'success'
        : providerPayment.status,
    )
  } catch {
    destination.searchParams.set('payment', 'verification_error')
  }
  return NextResponse.redirect(destination)
}
