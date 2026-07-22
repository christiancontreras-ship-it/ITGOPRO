import { redirect } from 'next/navigation'
import { CompanyOnboardingForm } from '@/components/company/company-onboarding-form'
import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'

export default async function CompanyOnboardingPage() {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  if (context.memberships.length) redirect('/app')
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
