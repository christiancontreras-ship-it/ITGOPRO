import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getPartnerPortal } from '@/services/partner.service'
export default async function PartnerPage() {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  const companyId = context.memberships.find(
    (item) => item.status === 'active',
  )?.company_id
  if (!companyId) return null
  const partner = await getPartnerPortal(companyId)
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Ecosistema ITGO</p>
      <h1>Portal Partner</h1>
      {!partner ? (
        <Card>
          <p>La empresa no tiene un perfil Partner activo.</p>
        </Card>
      ) : (
        <>
          <section className="metric-grid">
            <Card>
              <span>Especialistas</span>
              <strong>{partner.partner_specialists.length}</strong>
            </Card>
            <Card>
              <span>Clientes</span>
              <strong>{partner.partner_clients.length}</strong>
            </Card>
            <Card>
              <span>Comisión</span>
              <strong>{partner.commission_percent}%</strong>
            </Card>
          </section>
          <Card>
            <h2>Equipo</h2>
            {partner.partner_specialists.map((item) => (
              <p key={item.specialist_profiles?.public_name}>
                {item.specialist_profiles?.public_name} · {item.status}
              </p>
            ))}
          </Card>
          <Card>
            <h2>Clientes administrados</h2>
            {partner.partner_clients.map((item) => (
              <p key={item.companies?.legal_name}>
                {item.companies?.trade_name ?? item.companies?.legal_name} ·{' '}
                {item.status}
              </p>
            ))}
          </Card>
        </>
      )}
    </main>
  )
}
