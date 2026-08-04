import { Card } from '@/components/ui/card'
import {
  reconcileMercadoPagoPaymentAction,
  startMercadoPagoCheckoutAction,
} from './actions'
import { getCurrentAuthContext } from '@/services/auth.service'
import {
  getCompanyBilling,
  getPayableTickets,
} from '@/services/billing.service'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const { payment } = await searchParams
  const context = await getCurrentAuthContext()
  const companyId = context?.memberships.find(
    (item) => item.status === 'active',
  )?.company_id
  if (!companyId) return null
  const [{ plans, payments }, payableTickets] = await Promise.all([
    getCompanyBilling(companyId),
    getPayableTickets(companyId),
  ])
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Finanzas</p>
      <h1>Planes y pagos</h1>
      {payment === 'success' && (
        <p className="form-message success">
          Pago aprobado y contabilizado correctamente.
        </p>
      )}
      {payment && payment !== 'success' && (
        <p className="form-message error">
          El pago no fue aprobado o no pudo verificarse ({payment}).
        </p>
      )}
      <Card>
        <h2>Servicios pendientes de pago</h2>
        {payableTickets.length === 0 ? (
          <p>No hay servicios pendientes de pago.</p>
        ) : (
          payableTickets.map((ticket) => (
            <div key={ticket.id} className="dashboard-heading">
              <div>
                <strong>{ticket.code}</strong>
                <p>
                  {ticket.title} · CLP{' '}
                  {Number(ticket.final_cost).toLocaleString('es-CL')}
                </p>
              </div>
              {ticket.payments.some(
                (item) =>
                  item.provider === 'mercado_pago' &&
                  ['pending', 'authorized'].includes(item.status),
              ) ? (
                <form action={reconcileMercadoPagoPaymentAction}>
                  <input
                    type="hidden"
                    name="paymentId"
                    value={
                      ticket.payments.find(
                        (item) => item.provider === 'mercado_pago',
                      )?.id
                    }
                  />
                  <button className="button" type="submit">
                    Verificar pago
                  </button>
                </form>
              ) : (
                <form action={startMercadoPagoCheckoutAction}>
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <button className="button" type="submit">
                    Pagar con Mercado Pago
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </Card>
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
