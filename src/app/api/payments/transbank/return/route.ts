import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { commitWebpayTransaction } from '@/services/transbank.service'

export async function POST(request: NextRequest) {
  const destination = new URL('/app/billing', request.url)
  const form = await request.formData()
  const token = String(form.get('token_ws') ?? form.get('TBK_TOKEN') ?? '')
  if (!token) {
    destination.searchParams.set('payment', 'cancelled')
    return NextResponse.redirect(destination, 303)
  }
  const admin = createSupabaseAdminClient()
  const { data: payment } = await admin
    .from('payments')
    .select('id,status,provider_buy_order')
    .eq('provider', 'transbank')
    .eq('provider_reference', token)
    .maybeSingle()
  if (!payment) {
    destination.searchParams.set('payment', 'verification_error')
    return NextResponse.redirect(destination, 303)
  }
  if (!form.get('token_ws')) {
    await admin
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('id', payment.id)
    destination.searchParams.set('payment', 'cancelled')
    return NextResponse.redirect(destination, 303)
  }
  if (payment.status === 'captured') {
    destination.searchParams.set('payment', 'success')
    return NextResponse.redirect(destination, 303)
  }
  try {
    const result = await commitWebpayTransaction(token)
    const { error } = await admin.rpc('finalize_transbank_ticket_payment', {
      p_payment_id: payment.id,
      p_provider_reference: token,
      p_buy_order: result.buy_order,
      p_amount: result.amount,
      p_provider_status: result.status,
      p_response_code: result.response_code,
    })
    if (error) throw error
    destination.searchParams.set(
      'payment',
      result.status === 'AUTHORIZED' && result.response_code === 0
        ? 'success'
        : 'failed',
    )
  } catch (commitError) {
    console.error('[transbank:return] verification failed', {
      paymentId: payment.id,
      error:
        commitError instanceof Error ? commitError.message : 'unknown_error',
    })
    destination.searchParams.set('payment', 'transbank_verification_error')
  }
  return NextResponse.redirect(destination, 303)
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL('/app/billing?payment=cancelled', request.url),
  )
}
