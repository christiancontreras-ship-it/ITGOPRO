import { describe, expect, it } from 'vitest'

import { getAuthenticatedHomeRoute } from '@/lib/auth/home-route'

describe('getAuthenticatedHomeRoute', () => {
  it('prioritizes the customer portal for users with a company membership', () => {
    expect(
      getAuthenticatedHomeRoute({
        memberships: [{ id: 'membership' }],
        specialistProfile: { approval_status: 'approved' },
      }),
    ).toBe('/app')
  })

  it('routes specialists without a company to their specialist portal', () => {
    expect(
      getAuthenticatedHomeRoute({
        memberships: [],
        specialistProfile: { approval_status: 'approved' },
      }),
    ).toBe('/specialist')
  })

  it('keeps users without a company or specialist profile in onboarding', () => {
    expect(
      getAuthenticatedHomeRoute({
        memberships: [],
        specialistProfile: null,
      }),
    ).toBe('/app/onboarding')
  })
})
