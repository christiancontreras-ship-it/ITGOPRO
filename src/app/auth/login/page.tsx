import Link from 'next/link'
import { AuthForm } from '@/components/auth/auth-form'
import { Card } from '@/components/ui/card'
import { loginAction, oauthAction } from '../actions'

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <Card className="auth-card">
        <span className="logo">ITGO</span>
        <h1>Ingresa a tu cuenta</h1>
        <p>Administra servicios TI bajo demanda desde un acceso seguro.</p>
        <AuthForm action={loginAction} mode="login" />
        <div
          className="oauth-actions"
          aria-label="Ingreso con proveedor externo"
        >
          <form action={oauthAction}>
            <input type="hidden" name="provider" value="google" />
            <button className="button button-secondary" type="submit">
              Continuar con Google
            </button>
          </form>
          <form action={oauthAction}>
            <input type="hidden" name="provider" value="azure" />
            <button className="button button-secondary" type="submit">
              Continuar con Microsoft
            </button>
          </form>
        </div>
        <nav>
          <Link href="/auth/recovery">¿Olvidaste tu contraseña?</Link>
          <Link href="/auth/register">Crear cuenta</Link>
        </nav>
      </Card>
    </main>
  )
}
