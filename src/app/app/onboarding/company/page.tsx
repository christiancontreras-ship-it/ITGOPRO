import { redirect } from 'next/navigation'

import { CompanyOnboardingForm } from '@/components/company/company-onboarding-form'
import { Card } from '@/components/ui/card'
import { getAuthenticatedHomeRoute } from '@/lib/auth/home-route'
import { getCurrentAuthContext } from '@/services/auth.service'

export default async function CompanyOnboardingPage() {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')

  const homeRoute = getAuthenticatedHomeRoute(context)
  if (homeRoute !== '/app/onboarding/company') redirect(homeRoute)

  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <span className="logo">ITGO</span>
        <h1>Configura tu empresa</h1>
        <p>
          Estos datos crean el espacio privado y te asignan como propietario.
        </p>
        <CompanyOnboardingForm />
      </Card>
    </main>
  )
}
