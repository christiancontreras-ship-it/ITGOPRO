import { createHash } from 'node:crypto'

export function resolveSubscriptionPayerEmail(input: {
  mode?: string
  accountEmail: string
  testPayerEmail?: string
}) {
  if (input.mode !== 'test') return input.accountEmail.trim().toLowerCase()

  return input.testPayerEmail?.trim().toLowerCase() || 'test@testuser.com'
}

export function buildSubscriptionIdempotencyKey(input: {
  subscriptionId: string
  payerEmail: string
  amount: number
}) {
  const payloadFingerprint = createHash('sha256')
    .update(
      JSON.stringify({
        payerEmail: input.payerEmail.trim().toLowerCase(),
        amount: input.amount,
      }),
    )
    .digest('hex')
    .slice(0, 16)

  return `sub:${input.subscriptionId}:${payloadFingerprint}`
}
