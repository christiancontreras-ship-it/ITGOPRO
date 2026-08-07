import { Card } from '@/components/ui/card'
import {
  reconcileMercadoPagoPaymentAction,
  reconcileTransbankPaymentAction,
  startCompanySubscriptionAction,
  startMercadoPagoCheckoutAction,
  startTransbankCheckoutAction,
} from './actions'
import { getCurrentAuthContext } from '@/services/auth.service'
import {
  getCompanyBilling,
  getPayableTickets,
} from '@/services/billing.service'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; subscription?: string }>
}) {
  const { payment, subscription: subscriptionResult } = await searchParams
  const context = await getCurrentAuthContext()
  const companyId = context?.memberships.find(
    (item) => item.status === 'active',
  )?.company_id
  if (!companyId) return null
  const [{ plans, payments, subscription }, payableTickets] = await Promise.all(
    [getCompanyBilling(companyId), getPayableTickets(companyId)],
  )
  const paymentMessages: Record<string, string> = {
    cancelled: 'El pago fue cancelado antes de ser autorizado.',
    failed: 'Transbank rechazó o no autorizó el pago.',
    transbank_verification_error:
      'No fue posible confirmar el pago con Transbank.',
  }
  const subscriptionMessages: Record<string, string> = {
    cancelled: 'La activación del plan fue cancelada.',
    email_required: 'La cuenta debe tener un correo confirmado.',
    provider_error:
      'Mercado Pago rechazó la creación de la suscripción. Inténtalo nuevamente.',
    verification_error:
      'No fue posible verificar la suscripción con Mercado Pago.',
  }
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
          {paymentMessages[payment] ??
            `El pago no fue aprobado o no pudo verificarse (${payment}).`}
        </p>
      )}
      {subscriptionResult === 'success' && (
        <p className="form-message success">Plan activado correctamente.</p>
      )}
      {subscriptionResult && subscriptionResult !== 'success' && (
        <p className="form-message error">
          {subscriptionMessages[subscriptionResult] ??
            `No fue posible activar el plan (${subscriptionResult}).`}
        </p>
      )}
      {subscription && (
        <Card>
          <h2>Plan actual</h2>
          <p>
            <strong>{subscription.plans?.name}</strong> · {subscription.status}
          </p>
          {subscription.current_period_end && (
            <p>
              Próxima renovación:{' '}
              {new Date(subscription.current_period_end).toLocaleDateString(
                'es-CL',
              )}
            </p>
          )}
        </Card>
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
              <div className="button-row">
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
                {ticket.payments.some(
                  (item) =>
                    item.provider === 'transbank' &&
                    ['pending', 'authorized'].includes(item.status),
                ) ? (
                  <>
                    <form action={startTransbankCheckoutAction}>
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <button className="button secondary" type="submit">
                        Reintentar Webpay
                      </button>
                    </form>
                    <form action={reconcileTransbankPaymentAction}>
                      <input
                        type="hidden"
                        name="paymentId"
                        value={
                          ticket.payments.find(
                            (item) => item.provider === 'transbank',
                          )?.id
                        }
                      />
                      <button className="button secondary" type="submit">
                        Verificar Transbank
                      </button>
                    </form>
                  </>
                ) : (
                  <form action={startTransbankCheckoutAction}>
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <button className="button secondary" type="submit">
                      Pagar con Webpay
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
      <section className="metric-grid">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <h2>{plan.name}</h2>
            <strong>CLP {plan.price.toLocaleString('es-CL')}</strong>
            {plan.code !== 'company_free' &&
              subscription?.plan_id !== plan.id && (
                <form action={startCompanySubscriptionAction}>
                  <input type="hidden" name="planId" value={plan.id} />
                  <button className="button" type="submit">
                    Contratar mensualmente
                  </button>
                </form>
              )}
            {subscription?.plan_id === plan.id && (
              <p className="form-message success">Plan seleccionado</p>
            )}
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
