import { AuthForm } from '@/components/auth/auth-form'
import { Card } from '@/components/ui/card'
import { updatePasswordAction } from '../actions'

export default function UpdatePasswordPage() {
  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <span className="logo">ITGO</span>
        <h1>Nueva contraseña</h1>
        <AuthForm action={updatePasswordAction} mode="update-password" />
      </Card>
    </main>
  )
}
