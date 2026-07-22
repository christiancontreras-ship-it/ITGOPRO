import Link from 'next/link'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/app/auth/actions'
import { getCurrentAuthContext } from '@/services/auth.service'

export default async function SpecialistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await getCurrentAuthContext()
  if (!context) redirect('/auth/login')
  return (
    <div className="private-layout">
      <header className="private-header">
        <Link className="logo" href="/specialist">
          ITGO PRO
        </Link>
        <nav>
          <Link href="/specialist">Dashboard</Link>
          <Link href="/specialist/profile">Perfil</Link>
          <Link href="/app">Portal cliente</Link>
          <form action={logoutAction}>
            <button type="submit">Salir</button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  )
}
