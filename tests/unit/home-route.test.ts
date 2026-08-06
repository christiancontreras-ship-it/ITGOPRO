import { describe, expect, it } from 'vitest'

import { getAuthenticatedHomeRoute } from '@/lib/auth/home-route'

describe('getAuthenticatedHomeRoute', () => {
  it('prioritizes the customer portal for users with a company membership', () => {
    expect(
      getAuthenticatedHomeRoute({
        memberships: [{ id: 'membership' }],
        profile: { account_type: 'specialist' },
        specialistProfile: { approval_status: 'approved' },
      }),
    ).toBe('/app')
  })

  it('routes specialists without a company to their specialist portal', () => {
    expect(
      getAuthenticatedHomeRoute({
        memberships: [],
        profile: { account_type: 'specialist' },
        specialistProfile: { approval_status: 'approved' },
      }),
    ).toBe('/specialist')
  })

  it('routes a new specialist to professional profile setup', () => {
    expect(
      getAuthenticatedHomeRoute({
        memberships: [],
        profile: { account_type: 'specialist' },
        specialistProfile: null,
      }),
    ).toBe('/specialist/profile')
  })

  it('routes a new company account to company setup', () => {
    expect(
      getAuthenticatedHomeRoute({
        memberships: [],
        profile: { account_type: 'company' },
        specialistProfile: null,
      }),
    ).toBe('/app/onboarding/company')
  })

  it('asks legacy users without a type to choose one', () => {
    expect(
      getAuthenticatedHomeRoute({
        memberships: [],
        profile: { account_type: null },
        specialistProfile: null,
      }),
    ).toBe('/app/onboarding')
  })
})
