import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'

export default async function AppHomePage() {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  if (!context.memberships.length) redirect('/app/onboarding')
  const company = context.memberships[0]?.companies
  const companyName =
    company && !Array.isArray(company)
      ? (company.trade_name ?? company.legal_name)
      : 'Empresa ITGO'
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
        <span className="button button-disabled">Crear ticket — Etapa 4</span>
      </section>
      <section className="metric-grid" aria-label="Resumen ejecutivo">
        <Card>
          <span>Tickets abiertos</span>
          <strong>0</strong>
          <small>Sin actividad</small>
        </Card>
        <Card>
          <span>En proceso</span>
          <strong>0</strong>
          <small>Sin actividad</small>
        </Card>
        <Card>
          <span>Servicios activos</span>
          <strong>0</strong>
          <small>Disponibles en Etapa 11</small>
        </Card>
        <Card>
          <span>Alertas críticas</span>
          <strong>0</strong>
          <small>Sin alertas</small>
        </Card>
      </section>
      <section className="dashboard-grid">
        <Card>
          <h2>Actividad reciente</h2>
          <div className="empty-state">
            <strong>Aún no hay tickets</strong>
            <p>Cuando solicites soporte, aparecerá aquí con su estado y SLA.</p>
          </div>
        </Card>
        <Card>
          <h2>Accesos rápidos</h2>
          <nav className="quick-links">
            <Link href="/app/security">Seguridad y MFA</Link>
            <span>Marketplace — próxima etapa</span>
            <span>Servicios gestionados — próxima etapa</span>
          </nav>
        </Card>
      </section>
    </main>
  )
}
