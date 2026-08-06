type HomeRouteContext = {
  memberships: readonly unknown[]
  profile: {
    account_type: string | null
  } | null
  specialistProfile: {
    approval_status: string
  } | null
}

export function getAuthenticatedHomeRoute(context: HomeRouteContext) {
  if (context.memberships.length) return '/app'
  if (context.specialistProfile) return '/specialist'
  if (context.profile?.account_type === 'specialist')
    return '/specialist/profile'
  if (context.profile?.account_type === 'company')
    return '/app/onboarding/company'
  return '/app/onboarding'
}
