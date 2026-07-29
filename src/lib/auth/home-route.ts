type HomeRouteContext = {
  memberships: readonly unknown[]
  specialistProfile: {
    approval_status: string
  } | null
}

export function getAuthenticatedHomeRoute(context: HomeRouteContext) {
  if (context.memberships.length) return '/app'
  if (context.specialistProfile) return '/specialist'
  return '/app/onboarding'
}
