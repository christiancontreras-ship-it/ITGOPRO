import Link from 'next/link'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/app/auth/actions'
import { getCurrentAuthContext } from '@/services/auth.service'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  return (
    <div className="private-layout">
      <header className="private-header">
        <Link className="logo" href="/app">
          ITGO
        </Link>
        <nav>
          <Link href="/app">Resumen</Link>
          <Link href="/app/tickets">Tickets</Link>
          <Link href="/app/marketplace">Especialistas</Link>
          <Link href="/app/billing">Pagos</Link>
          <Link href="/app/managed-services">Servicios</Link>
          <Link href="/app/monitoring">Monitoreo</Link>
          <Link href="/partner">Partner</Link>
          <Link href="/app/security">Seguridad</Link>
          <form action={logoutAction}>
            <button type="submit">Salir</button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  )
}
