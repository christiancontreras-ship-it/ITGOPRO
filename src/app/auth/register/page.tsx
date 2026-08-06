import Link from 'next/link'

import { AuthForm } from '@/components/auth/auth-form'
import { Card } from '@/components/ui/card'

import { registerAction } from '../actions'

export default function RegisterPage() {
  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <span className="logo">ITGO</span>
        <h1>Crea tu cuenta</h1>
        <p>Elige tu tipo de cuenta para comenzar con el flujo correcto.</p>
        <AuthForm action={registerAction} mode="register" />
        <Link href="/auth/login">Ya tengo una cuenta</Link>
      </Card>
    </main>
  )
}
