import { describe, expect, it } from 'vitest'
import { companyOnboardingSchema } from '@/lib/validation/company-onboarding'

describe('onboarding de empresa', () => {
  it('acepta los datos mínimos', () =>
    expect(
      companyOnboardingSchema.safeParse({ legalName: 'ITGO Demo SpA' }).success,
    ).toBe(true))
  it('rechaza nombres vacíos y campos inesperados', () =>
    expect(
      companyOnboardingSchema.safeParse({ legalName: ' ', owner: true })
        .success,
    ).toBe(false))
})
