import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { getAuthenticatedHomeRoute } from '@/lib/auth/home-route'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getTicketDashboard } from '@/services/ticket.service'

export default async function AppHomePage() {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  if (!context.memberships.length) redirect(getAuthenticatedHomeRoute(context))
  const membership = context.memberships[0]
  const company = membership?.companies
  const companyId = membership?.company_id
  if (!companyId) redirect('/app/onboarding')
  const companyName =
    company && !Array.isArray(company)
      ? (company.trade_name ?? company.legal_name)
      : 'Empresa ITGO'
  const dashboard = await getTicketDashboard(companyId)
  return (
    <main className="dashboard-shell">
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">Panel cliente</p>
          <h1>{companyName}</h1>
          <p>
            Bienvenido,{' '}
            {context.profile?.display_name ?? context.email ?? 'usuario'}.
          </p>
        </div>
        <Link className="button" href="/app/tickets/new">
          Crear ticket
        </Link>
      </section>
      <section className="metric-grid" aria-label="Resumen ejecutivo">
        <Card>
          <span>Tickets abiertos</span>
          <strong>{dashboard.open}</strong>
          <small>
            {dashboard.open ? 'Requieren seguimiento' : 'Sin actividad'}
          </small>
        </Card>
        <Card>
          <span>En proceso</span>
          <strong>{dashboard.inProgress}</strong>
          <small>Trabajos activos</small>
        </Card>
        <Card>
          <span>Servicios activos</span>
          <strong>0</strong>
          <small>Disponibles en Etapa 11</small>
        </Card>
        <Card>
          <span>Alertas críticas</span>
          <strong>{dashboard.critical}</strong>
          <small>{dashboard.critical ? 'Revisar ahora' : 'Sin alertas'}</small>
        </Card>
      </section>
      <section className="dashboard-grid">
        <Card>
          <h2>Actividad reciente</h2>
          {dashboard.tickets.length ? (
            <div className="ticket-list">
              {dashboard.tickets.slice(0, 5).map((ticket) => (
                <Link key={ticket.id} href={`/app/tickets/${ticket.id}`}>
                  <span>
                    <strong>{ticket.code}</strong> {ticket.title}
                  </span>
                  <span>{ticket.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Aún no hay tickets</strong>
              <p>
                Cuando solicites soporte, aparecerá aquí con su estado y SLA.
              </p>
            </div>
          )}
        </Card>
        <Card>
          <h2>Accesos rápidos</h2>
          <nav className="quick-links">
            <Link href="/app/tickets">Ver tickets</Link>
            <Link href="/app/security">Seguridad y MFA</Link>
            <span>Marketplace — Etapa 5</span>
          </nav>
        </Card>
      </section>
    </main>
  )
}
