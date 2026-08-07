export function resolveSubscriptionPayerEmail(input: {
  mode?: string
  accountEmail: string
  testPayerEmail?: string
}) {
  if (input.mode !== 'test') return input.accountEmail.trim().toLowerCase()

  const testPayerEmail = input.testPayerEmail?.trim().toLowerCase()
  if (!testPayerEmail) throw new Error('MERCADOPAGO_TEST_PAYER_EMAIL_REQUIRED')

  return testPayerEmail
}
