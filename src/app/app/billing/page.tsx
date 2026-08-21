import { Card } from '@/components/ui/card'
import Link from 'next/link'
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
  const [{ plans, payments, subscription, renewalEvents }, payableTickets] =
    await Promise.all([
      getCompanyBilling(companyId),
      getPayableTickets(companyId),
    ])
  const latestReminder = renewalEvents.find((event) =>
    ['reminder_7d', 'reminder_3d', 'reminder_1d'].includes(event.event_type),
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
    transbank_provider_error:
      'Transbank no pudo iniciar el pago mensual. Inténtalo nuevamente.',
    transbank_verification_error:
      'No fue posible confirmar la activación del plan con Transbank.',
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
      {latestReminder && subscription?.status === 'authorized' && (
        <p className="form-message">
          Tu plan vence el{' '}
          {new Date(latestReminder.period_end).toLocaleDateString('es-CL')}.
          Renuévalo con Webpay para mantener sus beneficios.
        </p>
      )}
      {subscription?.status === 'expired' && (
        <p className="form-message error">
          El plan venció y la empresa volvió temporalmente a Free. Puedes
          renovarlo con Webpay en esta misma página.
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
              (subscription?.plan_id !== plan.id ||
                subscription.status === 'pending') && (
                <form action={startCompanySubscriptionAction}>
                  <input type="hidden" name="planId" value={plan.id} />
                  <button className="button" type="submit">
                    {subscription?.plan_id === plan.id
                      ? 'Renovar con Webpay'
                      : 'Contratar con Webpay'}
                  </button>
                  <small>
                    Vigencia mensual. La renovación requiere un nuevo pago.
                  </small>
                </form>
              )}
            {subscription?.plan_id === plan.id &&
              subscription.status === 'authorized' && (
                <p className="form-message success">Plan activo</p>
              )}
            {subscription?.plan_id === plan.id &&
              subscription.status === 'paused' && (
                <p className="form-message">Plan pausado</p>
              )}
            <p>Comisión {plan.commission_percent}%</p>
          </Card>
        ))}
      </section>
      <Card>
        <h2>Historial de pagos y renovaciones</h2>
        {payments.length === 0 && renewalEvents.length === 0 ? (
          <p>No hay movimientos registrados.</p>
        ) : (
          <>
            {payments.map((payment) => (
              <div key={payment.id} className="dashboard-heading">
                <p>
                  {payment.tickets?.code ??
                    payment.company_subscriptions?.plans?.name ??
                    'Pago'}{' '}
                  · {payment.status} · {payment.currency_code}{' '}
                  {payment.amount.toLocaleString('es-CL')} ·{' '}
                  {new Date(
                    payment.captured_at ?? payment.created_at,
                  ).toLocaleDateString('es-CL')}
                </p>
                {payment.subscription_id && payment.status === 'captured' && (
                  <Link
                    className="button secondary"
                    href={`/app/billing/receipts/${payment.id}`}
                  >
                    Ver comprobante
                  </Link>
                )}
              </div>
            ))}
            {renewalEvents
              .filter((event) => event.event_type === 'expired')
              .map((event) => (
                <p key={event.id}>
                  Plan vencido ·{' '}
                  {new Date(event.period_end).toLocaleDateString('es-CL')} ·
                  retorno a Free
                </p>
              ))}
          </>
        )}
      </Card>
    </main>
  )
}
