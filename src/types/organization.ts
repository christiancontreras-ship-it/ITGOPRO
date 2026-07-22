export type ProfileStatus = 'pending' | 'active' | 'suspended' | 'disabled'
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed'
export type MembershipStatus =
  'invited' | 'pending' | 'active' | 'suspended' | 'revoked'

export interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  displayName: string | null
  locale: string
  timeZone: string
  profileStatus: ProfileStatus
  onboardingStatus: OnboardingStatus
}

export interface Company {
  id: string
  legalName: string
  tradeName: string | null
  countryCode: string
  defaultCurrencyCode: string
  defaultLanguageCode: string
  defaultTimeZone: string
  status: 'draft' | 'active' | 'suspended' | 'disabled'
}

export interface CompanyMembership {
  id: string
  companyId: string
  userId: string
  status: MembershipStatus
  isPrimary: boolean
}
