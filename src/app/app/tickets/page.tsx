import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getTicketDashboard } from '@/services/ticket.service'

export default async function TicketsPage() {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  const companyId = context.memberships[0]?.company_id
  if (!companyId) redirect('/app/onboarding')
  const dashboard = await getTicketDashboard(companyId)
  return (
    <main className="dashboard-shell">
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">Mesa de servicio</p>
          <h1>Tickets</h1>
        </div>
        <Link className="button" href="/app/tickets/new">
          Crear ticket
        </Link>
      </section>
      <Card>
        {dashboard.tickets.length ? (
          <div className="ticket-list">
            {dashboard.tickets.map((ticket) => (
              <Link key={ticket.id} href={`/app/tickets/${ticket.id}`}>
                <span>
                  <strong>{ticket.code}</strong> {ticket.title}
                </span>
                <span className={`priority ${ticket.priority}`}>
                  {ticket.priority} · {ticket.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No hay tickets</strong>
            <p>Crea el primero para solicitar soporte.</p>
          </div>
        )}
      </Card>
    </main>
  )
}
