import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getOwnPayoutOverview } from '@/services/payout.service'
import { requestPayoutAction } from './actions'

export default async function SpecialistEarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>
}) {
  const context = await getCurrentAuthContext()
  if (!context?.specialistProfile) return null
  const overview = await getOwnPayoutOverview(context.specialistProfile.id)
  const { result } = await searchParams
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Finanzas</p>
      <h1>Ingresos y liquidaciones</h1>
      {result === 'requested' && (
        <p className="form-message success">
          Liquidación solicitada correctamente.
        </p>
      )}
      {result === 'unavailable' && (
        <p className="form-message error">
          No hay saldo disponible o ya existe una liquidación en curso.
        </p>
      )}
      <section className="metric-grid">
        <Card>
          <span>Disponible</span>
          <strong>CLP {overview.available.toLocaleString('es-CL')}</strong>
        </Card>
        <Card>
          <span>En liquidación</span>
          <strong>CLP {overview.held.toLocaleString('es-CL')}</strong>
        </Card>
        <Card>
          <span>Pagado</span>
          <strong>CLP {overview.paid.toLocaleString('es-CL')}</strong>
        </Card>
      </section>
      <Card>
        <h2>Solicitar liquidación</h2>
        <p>
          La solicitud incluye todas tus comisiones disponibles y queda
          pendiente de aprobación de ITGO.
        </p>
        <form action={requestPayoutAction}>
          <button
            className="button"
            type="submit"
            disabled={overview.available <= 0}
          >
            Solicitar pago
          </button>
        </form>
      </Card>
      <Card>
        <h2>Historial</h2>
        {overview.payouts.length === 0 ? (
          <p>No hay liquidaciones registradas.</p>
        ) : (
          overview.payouts.map((payout) => (
            <p key={payout.id}>
              {new Date(payout.requested_at).toLocaleDateString('es-CL')} ·{' '}
              {payout.status} · {payout.currency_code}{' '}
              {Number(payout.amount).toLocaleString('es-CL')}
              {payout.bank_reference ? ` · Ref. ${payout.bank_reference}` : ''}
            </p>
          ))
        )}
      </Card>
    </main>
  )
}
