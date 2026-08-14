import { describe, expect, it } from 'vitest'
import {
  buildSubscriptionCheckoutUrl,
  resolveSubscriptionPayerEmail,
  resolveSubscriptionPlanId,
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

describe('buildSubscriptionCheckoutUrl', () => {
  it('construye el checkout alojado del plan', () => {
    expect(buildSubscriptionCheckoutUrl(' plan-id ')).toBe(
      'https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=plan-id',
    )
  })
})

describe('resolveSubscriptionPlanId', () => {
  it('selecciona el plan Business configurado', () => {
    expect(
      resolveSubscriptionPlanId({
        planName: ' Business ',
        businessPlanId: ' business-plan-id ',
        corporatePlanId: 'corporate-plan-id',
      }),
    ).toBe('business-plan-id')
  })

  it('selecciona el plan Corporate configurado', () => {
    expect(
      resolveSubscriptionPlanId({
        planName: 'Corporate',
        businessPlanId: 'business-plan-id',
        corporatePlanId: ' corporate-plan-id ',
      }),
    ).toBe('corporate-plan-id')
  })

  it('rechaza planes sin identificador de proveedor', () => {
    expect(
      resolveSubscriptionPlanId({
        planName: 'Free',
        businessPlanId: 'business-plan-id',
      }),
    ).toBeUndefined()
  })
})
