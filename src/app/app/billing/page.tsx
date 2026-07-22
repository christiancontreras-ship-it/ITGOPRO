import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getCompanyBilling } from '@/services/billing.service'

export default async function BillingPage() {
  const context = await getCurrentAuthContext()
  const companyId = context?.memberships.find(
    (item) => item.status === 'active',
  )?.company_id
  if (!companyId) return null
  const { plans, payments } = await getCompanyBilling(companyId)
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Finanzas</p>
      <h1>Planes y pagos</h1>
      <section className="metric-grid">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <h2>{plan.name}</h2>
            <strong>CLP {plan.price.toLocaleString('es-CL')}</strong>
            <p>Comisión {plan.commission_percent}%</p>
          </Card>
        ))}
      </section>
      <Card>
        <h2>Historial</h2>
        {payments.length === 0 ? (
          <p>No hay pagos registrados.</p>
        ) : (
          payments.map((payment) => (
            <p key={payment.id}>
              {payment.tickets?.code} · {payment.status} ·{' '}
              {payment.currency_code} {payment.amount.toLocaleString('es-CL')}
            </p>
          ))
        )}
      </Card>
    </main>
  )
}
