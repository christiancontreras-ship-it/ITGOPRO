import { redirect } from 'next/navigation'
import { MfaManager } from '@/components/auth/mfa-manager'
import { Card } from '@/components/ui/card'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function SecurityPage() {
  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) redirect('/auth/login')
  const { data } = await supabase.auth.mfa.listFactors()
  const [{ data: controls }, { data: risks }, { data: incidents }] =
    await Promise.all([
      supabase.from('security_controls').select('id,implementation_status'),
      supabase.from('security_risks').select('id,status,inherent_score'),
      supabase.from('security_incidents').select('id,status,severity'),
    ])
  const factors = (data?.totp ?? [])
    .filter((factor) => factor.status === 'verified')
    .map((factor) => ({ id: factor.id, friendlyName: factor.friendly_name }))
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Preparación y alineamiento</p>
      <h1>Seguridad, privacidad y continuidad</h1>
      <section className="metric-grid">
        <Card>
          <span>Controles implementados</span>
          <strong>
            {controls?.filter(
              (item) => item.implementation_status === 'implemented',
            ).length ?? 0}
          </strong>
        </Card>
        <Card>
          <span>Riesgos abiertos</span>
          <strong>
            {risks?.filter((item) => item.status !== 'closed').length ?? 0}
          </strong>
        </Card>
        <Card>
          <span>Incidentes activos</span>
          <strong>
            {incidents?.filter(
              (item) => !['resolved', 'closed'].includes(item.status),
            ).length ?? 0}
          </strong>
        </Card>
      </section>
      <Card>
        <span className="logo">ITGO</span>
        <h1>Seguridad de la cuenta</h1>
        <MfaManager initialFactors={factors} />
      </Card>
    </main>
  )
}
