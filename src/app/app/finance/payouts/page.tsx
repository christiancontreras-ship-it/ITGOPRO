import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getAdminPayouts } from '@/services/payout.service'
import { approvePayoutAction, recordPayoutTransferAction } from './actions'

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>
}) {
  const context = await getCurrentAuthContext()
  const isAdmin = context?.platformRoles.some((entry) =>
    ['platform_super_admin', 'platform_admin'].includes(
      entry.roles?.code ?? '',
    ),
  )
  if (!isAdmin) redirect('/app')
  const payouts = await getAdminPayouts()
  const { result } = await searchParams
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Finanzas ITGO</p>
      <h1>Liquidaciones de especialistas</h1>
      {result && (
        <p
          className={`form-message ${result === 'error' ? 'error' : 'success'}`}
        >
          {result === 'error'
            ? 'No fue posible procesar la liquidación.'
            : 'Liquidación actualizada correctamente.'}
        </p>
      )}
      {payouts.length === 0 ? (
        <Card>
          <p>No hay liquidaciones solicitadas.</p>
        </Card>
      ) : (
        payouts.map((payout) => (
          <Card key={payout.id}>
            <h2>{payout.specialist_profiles?.public_name ?? 'Especialista'}</h2>
            <p>
              {payout.currency_code}{' '}
              {Number(payout.amount).toLocaleString('es-CL')} · {payout.status}
            </p>
            {payout.status === 'requested' && (
              <form action={approvePayoutAction}>
                <input type="hidden" name="payoutId" value={payout.id} />
                <button className="button" type="submit">
                  Aprobar liquidación
                </button>
              </form>
            )}
            {payout.status === 'approved' && (
              <form action={recordPayoutTransferAction} className="stack">
                <input type="hidden" name="payoutId" value={payout.id} />
                <label>
                  Referencia bancaria
                  <input name="bankReference" minLength={3} required />
                </label>
                <label>
                  Referencia de comprobante
                  <input name="proofReference" />
                </label>
                <button className="button" type="submit">
                  Registrar transferencia
                </button>
              </form>
            )}
            {payout.bank_reference && (
              <p>Referencia bancaria: {payout.bank_reference}</p>
            )}
          </Card>
        ))
      )}
    </main>
  )
}
