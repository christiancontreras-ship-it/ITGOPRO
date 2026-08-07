import { describe, expect, it } from 'vitest'
import { resolveSubscriptionPayerEmail } from '@/lib/payments/mercadopago'

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
