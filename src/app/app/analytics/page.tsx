import { Card } from '@/components/ui/card'
import { getCompanyAnalytics } from '@/services/analytics.service'
import { getCurrentAuthContext } from '@/services/auth.service'
export default async function AnalyticsPage() {
  const context = await getCurrentAuthContext()
  const companyId = context?.memberships.find(
    (item) => item.status === 'active',
  )?.company_id
  if (!companyId) return null
  const { metrics, goals } = await getCompanyAnalytics(companyId)
  const latest = metrics[0]
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Modelo semántico</p>
      <h1>Analítica ejecutiva</h1>
      <section className="metric-grid">
        <Card>
          <span>Tickets creados</span>
          <strong>{latest?.tickets_created ?? 0}</strong>
        </Card>
        <Card>
          <span>Tickets cerrados</span>
          <strong>{latest?.tickets_closed ?? 0}</strong>
        </Card>
        <Card>
          <span>Pagos capturados</span>
          <strong>
            CLP {(latest?.payments_captured ?? 0).toLocaleString('es-CL')}
          </strong>
        </Card>
        <Card>
          <span>Alertas abiertas</span>
          <strong>{latest?.open_alerts ?? 0}</strong>
        </Card>
      </section>
      <Card>
        <h2>Serie diaria</h2>
        {metrics.length === 0 ? (
          <p>No hay métricas procesadas.</p>
        ) : (
          metrics.map((metric) => (
            <p key={metric.metric_date}>
              {metric.metric_date} · {metric.tickets_created} creados ·{' '}
              {metric.tickets_closed} cerrados
            </p>
          ))
        )}
      </Card>
      <Card>
        <h2>Metas</h2>
        {goals.length === 0 ? (
          <p>No hay metas configuradas.</p>
        ) : (
          goals.map((goal) => (
            <p key={goal.id}>
              {goal.metric_code}: {goal.target_value}
            </p>
          ))
        )}
      </Card>
    </main>
  )
}
