import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getCompanyPaymentReceipt } from '@/services/billing.service'

export default async function SubscriptionReceiptPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  const { paymentId } = await params
  const context = await getCurrentAuthContext()
  const companyId = context?.memberships.find(
    (membership) => membership.status === 'active',
  )?.company_id
  if (!companyId) notFound()

  const receipt = await getCompanyPaymentReceipt(companyId, paymentId)
  if (!receipt || receipt.status !== 'captured') notFound()

  const company = receipt.companies
  const subscription = receipt.company_subscriptions

  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Comprobante ITGO</p>
      <h1>Pago de plan</h1>
      <Card>
        <p>
          <strong>Comprobante:</strong> {receipt.id}
        </p>
        <p>
          <strong>Empresa:</strong>{' '}
          {company?.trade_name || company?.legal_name || 'Empresa ITGO'}
        </p>
        {company?.tax_id && (
          <p>
            <strong>RUT:</strong> {company.tax_id}
          </p>
        )}
        <p>
          <strong>Plan:</strong> {subscription?.plans?.name ?? 'Plan ITGO'}
        </p>
        <p>
          <strong>Monto:</strong> {receipt.currency_code}{' '}
          {receipt.amount.toLocaleString('es-CL')}
        </p>
        <p>
          <strong>Medio:</strong> {receipt.provider}
        </p>
        <p>
          <strong>Estado:</strong> Pagado
        </p>
        <p>
          <strong>Fecha:</strong>{' '}
          {new Date(receipt.captured_at ?? receipt.created_at).toLocaleString(
            'es-CL',
          )}
        </p>
        {receipt.provider_reference && (
          <p>
            <strong>Referencia:</strong> {receipt.provider_reference}
          </p>
        )}
        {receipt.subscription_period_start && (
          <p>
            <strong>Vigencia desde:</strong>{' '}
            {new Date(receipt.subscription_period_start).toLocaleDateString(
              'es-CL',
            )}
          </p>
        )}
        {receipt.subscription_period_end && (
          <p>
            <strong>Vigencia hasta:</strong>{' '}
            {new Date(receipt.subscription_period_end).toLocaleDateString(
              'es-CL',
            )}
          </p>
        )}
      </Card>
      <p>
        Este comprobante acredita el registro del pago en ITGO. La emisión de
        documentos tributarios se gestiona por separado.
      </p>
    </main>
  )
}
