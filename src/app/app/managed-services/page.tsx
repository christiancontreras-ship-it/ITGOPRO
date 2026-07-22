import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getManagedServices } from '@/services/managed-service.service'

export default async function ManagedServicesPage() {
  const context = await getCurrentAuthContext()
  const companyId = context?.memberships.find(
    (item) => item.status === 'active',
  )?.company_id
  if (!companyId) return null
  const { catalog, services } = await getManagedServices(companyId)
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Operación recurrente</p>
      <h1>Servicios gestionados</h1>
      <section className="metric-grid">
        {catalog.map((item) => (
          <Card key={item.id}>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <strong>
              CLP {item.monthly_price.toLocaleString('es-CL')} / mes
            </strong>
            <small>SLA base {item.default_sla_hours} h</small>
          </Card>
        ))}
      </section>
      <Card>
        <h2>Contratos activos</h2>
        {services.length === 0 ? (
          <p>No hay servicios contratados.</p>
        ) : (
          services.map((service) => (
            <p key={service.id}>
              {service.managed_service_catalog?.name} · {service.status}
            </p>
          ))
        )}
      </Card>
    </main>
  )
}
