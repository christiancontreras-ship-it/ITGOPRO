import 'server-only'

import {
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  WebpayPlus,
} from 'transbank-sdk'
import { buildTransbankBuyOrder } from '@/lib/payments/transbank'

export { buildTransbankBuyOrder } from '@/lib/payments/transbank'

type WebpayCreateResponse = { token: string; url: string }
export type WebpayCommitResponse = {
  vci: string
  amount: number
  status: string
  buy_order: string
  session_id: string
  card_detail: { card_number: string }
  accounting_date: string
  transaction_date: string
  authorization_code: string
  payment_type_code: string
  response_code: number
  installments_number: number
}

function transaction() {
  if ((process.env.TRANSBANK_MODE ?? 'integration') === 'production') {
    const commerceCode = process.env.TRANSBANK_COMMERCE_CODE
    const apiKey = process.env.TRANSBANK_API_KEY
    if (!commerceCode || !apiKey)
      throw new Error('Credenciales productivas de Transbank no configuradas')
    return WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey)
  }
  return WebpayPlus.Transaction.buildForIntegration(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
  )
}

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.itgopro.cl')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '')
}

export async function createWebpayTransaction(input: {
  paymentId: string
  amount: number
}) {
  const buyOrder = buildTransbankBuyOrder(input.paymentId)
  const returnUrl = new URL('/api/payments/transbank/return', appBaseUrl())
  returnUrl.searchParams.set('paymentId', input.paymentId)
  const response = (await transaction().create(
    buyOrder,
    input.paymentId,
    input.amount,
    returnUrl.toString(),
  )) as WebpayCreateResponse
  if (!response.token || !response.url)
    throw new Error('Transbank no entregó una sesión de pago válida')
  return { ...response, buyOrder }
}

export async function commitWebpayTransaction(token: string) {
  return (await transaction().commit(token)) as WebpayCommitResponse
}

export async function getWebpayTransactionStatus(token: string) {
  return (await transaction().status(token)) as WebpayCommitResponse
}
