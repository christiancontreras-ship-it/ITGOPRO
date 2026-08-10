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

  it('mantiene la clave para reintentos con el mismo payload', () => {
    const first = buildSubscriptionIdempotencyKey({
      subscriptionId,
      payerEmail: ' TEST@TESTUSER.COM ',
      amount: 29_990,
    })
    const retry = buildSubscriptionIdempotencyKey({
      subscriptionId,
      payerEmail: 'test@testuser.com',
      amount: 29_990,
    })

    expect(retry).toBe(first)
    expect(retry.length).toBeLessThanOrEqual(64)
  })

  it('cambia la clave cuando cambia el payload', () => {
    const previousPayload = buildSubscriptionIdempotencyKey({
      subscriptionId,
      payerEmail: 'real@example.com',
      amount: 29_990,
    })
    const sandboxPayload = buildSubscriptionIdempotencyKey({
      subscriptionId,
      payerEmail: 'test@testuser.com',
      amount: 29_990,
    })

    expect(sandboxPayload).not.toBe(previousPayload)
  })
})
