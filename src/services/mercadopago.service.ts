import 'server-only'

const API_URL = 'https://api.mercadopago.com'

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

    try {
      const parsed = JSON.parse(responseBody) as {
        error?: string
        message?: string
      }
      providerMessage = parsed.message ?? parsed.error ?? providerMessage
    } catch {
      // Avoid logging arbitrary provider HTML or response bodies.
    }

    throw new Error(
      `Mercado Pago request failed: status=${response.status} message=${providerMessage}`,
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.itgopro.cl'
  const returnUrl = new URL(
    '/api/payments/mercadopago/return',
    baseUrl,
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
