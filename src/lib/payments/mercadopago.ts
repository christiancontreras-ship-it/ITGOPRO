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
}) {
  return input.subscriptionId
}
