import { describe, expect, it } from 'vitest'
import {
  buildSubscriptionIdempotencyKey,
  resolveSubscriptionPayerEmail,
} from '@/lib/payments/mercadopago'

describe('resolveSubscriptionPayerEmail', () => {
  it('usa el comprador de prueba en modo test', () => {
    expect(
      resolveSubscriptionPayerEmail({
        mode: 'test',
        accountEmail: 'real@example.com',
        testPayerEmail: ' TEST_PAYER@TESTUSER.COM ',
      }),
    ).toBe('test_payer@testuser.com')
  })

  it('usa el correo sandbox oficial cuando no hay uno configurado', () => {
    expect(
      resolveSubscriptionPayerEmail({
        mode: 'test',
        accountEmail: 'real@example.com',
      }),
    ).toBe('test@testuser.com')
  })

  it('usa el correo de la cuenta fuera del sandbox', () => {
    expect(
      resolveSubscriptionPayerEmail({
        mode: 'production',
        accountEmail: ' Customer@Example.com ',
      }),
    ).toBe('customer@example.com')
  })
})

describe('buildSubscriptionIdempotencyKey', () => {
  const subscriptionId = '4c385787-fa6e-448c-8e0c-dfda5b150fa7'

  it('usa el UUID v4 de la suscripción sin prefijos ni sufijos', () => {
    const key = buildSubscriptionIdempotencyKey({ subscriptionId })

    expect(key).toBe(subscriptionId)
    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })
})
