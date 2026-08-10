import 'server-only'

import {
  buildSubscriptionIdempotencyKey,
  resolveSubscriptionPayerEmail,
} from '@/lib/payments/mercadopago'

const API_URL = 'https://api.mercadopago.com'

type MercadoPagoProviderCause = {
  code?: string | number
  description?: string
  data?: string
}

export class MercadoPagoProviderError extends Error {
  constructor(
    public readonly status: number,
    public readonly providerMessage: string,
    public readonly requestId: string | null,
    public readonly causes: MercadoPagoProviderCause[],
  ) {
    super(
      `Mercado Pago request failed: status=${status} message=${providerMessage}`,
    )
    this.name = 'MercadoPagoProviderError'
  }
}

function accessToken() {
  const value = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!value) throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado')
  return value
}

async function mercadoPagoFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  })
  if (!response.ok) {
    const responseBody = await response.text()
    let providerMessage = 'Respuesta sin detalle'
    let causes: MercadoPagoProviderCause[] = []

    try {
      const parsed = JSON.parse(responseBody) as {
        error?: string
        message?: string
        cause?: MercadoPagoProviderCause[]
        causes?: MercadoPagoProviderCause[]
      }
      providerMessage = parsed.message ?? parsed.error ?? providerMessage
      causes = Array.isArray(parsed.cause)
        ? parsed.cause
        : Array.isArray(parsed.causes)
          ? parsed.causes
          : []
    } catch {
      // Avoid logging arbitrary provider HTML or response bodies.
    }

    throw new MercadoPagoProviderError(
      response.status,
      providerMessage,
      response.headers.get('x-request-id') ??
        response.headers.get('x-correlation-id'),
      causes.map((cause) => ({
        code: cause.code,
        description: cause.description,
        data: cause.data,
      })),
    )
  }
  return response.json() as Promise<T>
}

export async function createCheckoutPreference(input: {
  paymentId: string
  ticketCode: string
  title: string
  amount: number
}) {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.itgopro.cl'
  const baseUrl = configuredBaseUrl
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\/+$/, '')
  const returnUrl = new URL(
    '/api/payments/mercadopago/return',
    /^https?:\/\//i.test(baseUrl) ? baseUrl : 'https://www.itgopro.cl',
  ).toString()
  const notificationUrl = new URL(
    '/api/payments/mercadopago/webhook',
    /^https?:\/\//i.test(baseUrl) ? baseUrl : 'https://www.itgopro.cl',
  ).toString()
  return mercadoPagoFetch<{
    id: string
    init_point: string
    sandbox_init_point: string
  }>('/checkout/preferences', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': input.paymentId },
    body: JSON.stringify({
      items: [
        {
          id: input.ticketCode,
          title: `Servicio ITGO ${input.ticketCode}: ${input.title}`,
          quantity: 1,
          currency_id: 'CLP',
          unit_price: input.amount,
        },
      ],
      external_reference: input.paymentId,
      back_urls: {
        success: returnUrl,
        pending: returnUrl,
        failure: returnUrl,
      },
      auto_return: 'approved',
      notification_url: notificationUrl,
    }),
  })
}

export async function getMercadoPagoPayment(paymentId: string) {
  return mercadoPagoFetch<{
    id: number
    status: string
    transaction_amount: number
    external_reference: string | null
  }>(`/v1/payments/${encodeURIComponent(paymentId)}`)
}

export async function findMercadoPagoPayments(externalReference: string) {
  const search = new URLSearchParams({
    external_reference: externalReference,
    sort: 'date_created',
    criteria: 'desc',
  })

  return mercadoPagoFetch<{
    results: Array<{
      id: number
      status: string
      transaction_amount: number
      external_reference: string | null
    }>
  }>(`/v1/payments/search?${search.toString()}`)
}

export type MercadoPagoSubscription = {
  id: string
  status: string
  external_reference: string
  init_point?: string
  payer_email?: string
}

export async function createMercadoPagoSubscription(input: {
  subscriptionId: string
  planName: string
  amount: number
  payerEmail: string
}) {
  const payerEmail = resolveSubscriptionPayerEmail({
    mode: process.env.MERCADOPAGO_MODE,
    accountEmail: input.payerEmail,
    testPayerEmail: process.env.MERCADOPAGO_TEST_PAYER_EMAIL,
  })
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.itgopro.cl'
  const baseUrl = configuredBaseUrl
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '')
  const backUrl = new URL(
    '/api/payments/mercadopago/subscription-return',
    baseUrl,
  ).toString()
  const idempotencyKey = buildSubscriptionIdempotencyKey({
    subscriptionId: input.subscriptionId,
  })
  return mercadoPagoFetch<MercadoPagoSubscription>('/preapproval', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      reason: `Plan ITGO ${input.planName}`,
      external_reference: input.subscriptionId,
      payer_email: payerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: input.amount,
        currency_id: 'CLP',
      },
      back_url: backUrl,
      status: 'pending',
    }),
  })
}

export async function getMercadoPagoSubscription(subscriptionId: string) {
  return mercadoPagoFetch<MercadoPagoSubscription>(
    `/preapproval/${encodeURIComponent(subscriptionId)}`,
  )
}
