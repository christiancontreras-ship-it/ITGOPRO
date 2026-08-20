import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  createMercadoPagoSubscription,
  MercadoPagoProviderError,
} from '@/services/mercadopago.service'

const requestSchema = z
  .object({
    planId: z.uuid(),
    cardTokenId: z.string().trim().min(8).max(256),
    payerEmail: z.email(),
  })
  .strict()

function safeError(message: string, status: number) {
  return NextResponse.json({ message }, { status })
}

export async function POST(request: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL
  const requestOrigin = request.headers.get('origin')
  if (
    configuredOrigin &&
    requestOrigin &&
    new URL(configuredOrigin).origin !== requestOrigin
  ) {
    return safeError('Origen de solicitud no autorizado.', 403)
  }

  let parsed: z.infer<typeof requestSchema>
  try {
    parsed = requestSchema.parse(await request.json())
  } catch {
    return safeError('Datos de suscripción inválidos.', 400)
  }

  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user?.email) {
    return safeError('Debes iniciar sesión con un correo confirmado.', 401)
  }

  const { data, error } = await supabase
    .rpc('initialize_company_subscription', {
      p_plan_id: parsed.planId,
      p_payer_email: parsed.payerEmail,
    })
    .single()
  if (error || !data) {
    return safeError('No fue posible iniciar la suscripción.', 422)
  }

  const admin = createSupabaseAdminClient()
  try {
    const providerSubscription = await createMercadoPagoSubscription({
      subscriptionId: data.subscription_id,
      planName: data.plan_name,
      payerEmail: parsed.payerEmail,
      cardTokenId: parsed.cardTokenId,
    })
    const { error: syncError } = await admin.rpc('sync_company_subscription', {
      p_subscription_id: data.subscription_id,
      p_provider_subscription_id: providerSubscription.id,
      p_status: providerSubscription.status,
      p_checkout_url: providerSubscription.init_point,
    })
    if (syncError) throw syncError

    return NextResponse.json(
      { status: providerSubscription.status },
      { status: 201 },
    )
  } catch (error) {
    console.error('[mercadopago:subscription:direct] failed', {
      subscriptionId: data.subscription_id,
      error: error instanceof Error ? error.message : 'unknown_error',
      provider:
        error instanceof MercadoPagoProviderError
          ? {
              status: error.status,
              message: error.providerMessage,
              requestId: error.requestId,
              causes: error.causes,
            }
          : undefined,
    })
    const { error: markFailedError } = await admin
      .from('company_subscriptions')
      .update({ status: 'failed' })
      .eq('id', data.subscription_id)
    if (markFailedError) {
      console.error('[mercadopago:subscription:direct] mark_failed_error', {
        subscriptionId: data.subscription_id,
        error: markFailedError.message,
      })
    }
    return safeError(
      error instanceof MercadoPagoProviderError
        ? 'Mercado Pago no pudo autorizar la tarjeta. Revisa los datos o utiliza otra tarjeta.'
        : 'No fue posible activar el plan. Inténtalo nuevamente.',
      502,
    )
  }
}
