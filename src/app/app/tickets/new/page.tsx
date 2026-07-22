import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { TicketForm } from '@/components/tickets/ticket-form'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getTicketCategories } from '@/services/ticket.service'

export default async function NewTicketPage() {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  const companyId = context.memberships[0]?.company_id
  if (!companyId) redirect('/app/onboarding')
  const categories = await getTicketCategories()
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Nuevo requerimiento</p>
      <h1>Crear ticket</h1>
      <Card>
        <TicketForm companyId={companyId} categories={categories} />
      </Card>
    </main>
  )
}
