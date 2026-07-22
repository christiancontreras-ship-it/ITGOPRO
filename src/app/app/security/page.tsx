import { redirect } from 'next/navigation'
import { MfaManager } from '@/components/auth/mfa-manager'
import { Card } from '@/components/ui/card'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function SecurityPage() {
  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) redirect('/auth/login')
  const { data } = await supabase.auth.mfa.listFactors()
  const factors = (data?.totp ?? [])
    .filter((factor) => factor.status === 'verified')
    .map((factor) => ({ id: factor.id, friendlyName: factor.friendly_name }))
  return (
    <main className="app-shell">
      <Card>
        <span className="logo">ITGO</span>
        <h1>Seguridad de la cuenta</h1>
        <MfaManager initialFactors={factors} />
      </Card>
    </main>
  )
}
