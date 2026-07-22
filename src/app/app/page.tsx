import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { logoutAction } from '@/app/auth/actions'
import { getCurrentAuthContext } from '@/services/auth.service'

export default async function AppHomePage() {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  return (
    <main className="app-shell">
      <Card>
        <span className="logo">ITGO</span>
        <h1>Acceso autenticado</h1>
        <p>
          {context.profile?.display_name ?? context.email ?? 'Usuario ITGO'}
        </p>
        <p>{context.memberships.length} empresa(s) activa(s).</p>
        <p>
          <Link href="/app/security">Seguridad y MFA</Link>
        </p>
        <form action={logoutAction}>
          <button className="button button-secondary" type="submit">
            Cerrar sesión
          </button>
        </form>
      </Card>
    </main>
  )
}
