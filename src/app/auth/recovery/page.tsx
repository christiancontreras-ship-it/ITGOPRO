import Link from 'next/link'
import { AuthForm } from '@/components/auth/auth-form'
import { Card } from '@/components/ui/card'
import { recoveryAction } from '../actions'

export default function RecoveryPage() {
  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <span className="logo">ITGO</span>
        <h1>Recupera tu acceso</h1>
        <p>
          Te enviaremos instrucciones si el correo corresponde a una cuenta.
        </p>
        <AuthForm action={recoveryAction} mode="recovery" />
        <Link href="/auth/login">Volver al ingreso</Link>
      </Card>
    </main>
  )
}
