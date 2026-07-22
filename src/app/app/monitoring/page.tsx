import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getMonitoringOverview } from '@/services/monitoring.service'
export default async function MonitoringPage() {
  const context = await getCurrentAuthContext()
  const companyId = context?.memberships.find(
    (item) => item.status === 'active',
  )?.company_id
  if (!companyId) return null
  const { assets, alerts } = await getMonitoringOverview(companyId)
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Observabilidad</p>
      <h1>Monitoreo de activos</h1>
      <section className="metric-grid">
        <Card>
          <span>Activos</span>
          <strong>{assets.length}</strong>
        </Card>
        <Card>
          <span>Críticos</span>
          <strong>
            {
              alerts.filter(
                (a) => a.severity === 'critical' && a.status === 'open',
              ).length
            }
          </strong>
        </Card>
      </section>
      <Card>
        <h2>Activos</h2>
        {assets.length === 0 ? (
          <p>No hay activos registrados.</p>
        ) : (
          assets.map((asset) => (
            <p key={asset.id}>
              {asset.name} · {asset.status}
            </p>
          ))
        )}
      </Card>
      <Card>
        <h2>Alertas recientes</h2>
        {alerts.length === 0 ? (
          <p>No hay alertas.</p>
        ) : (
          alerts.map((alert) => (
            <p key={alert.id}>
              {alert.severity} · {alert.title}
            </p>
          ))
        )}
      </Card>
    </main>
  )
}
