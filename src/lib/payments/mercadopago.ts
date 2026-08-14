export function resolveSubscriptionPayerEmail(input: {
  mode?: string
  accountEmail: string
  testPayerEmail?: string
}) {
  if (input.mode !== 'test') return input.accountEmail.trim().toLowerCase()

  return input.testPayerEmail?.trim().toLowerCase() || 'test@testuser.com'
}

export function resolveSubscriptionPlanId(input: {
  planName: string
  businessPlanId?: string
  corporatePlanId?: string
}) {
  const normalizedPlanName = input.planName.trim().toLowerCase()

  if (normalizedPlanName === 'business') return input.businessPlanId?.trim()
  if (normalizedPlanName === 'corporate') return input.corporatePlanId?.trim()

  return undefined
}

export function buildSubscriptionCheckoutUrl(preapprovalPlanId: string) {
  const url = new URL('https://www.mercadopago.cl/subscriptions/checkout')
  url.searchParams.set('preapproval_plan_id', preapprovalPlanId.trim())
  return url.toString()
}
