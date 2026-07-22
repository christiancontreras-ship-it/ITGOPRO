'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import type { AuthActionState } from '@/lib/validation/auth'

type AuthFormProps = {
  action: (state: AuthActionState, data: FormData) => Promise<AuthActionState>
  mode: 'login' | 'register' | 'recovery' | 'update-password'
}

const initialState: AuthActionState = { status: 'idle' }

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const showEmail = mode !== 'update-password'
  const showPassword =
    mode === 'login' || mode === 'register' || mode === 'update-password'

  return (
    <form action={formAction} className="auth-form">
      {mode === 'register' && (
        <>
          <label>
            Nombre
            <input name="firstName" autoComplete="given-name" required />
          </label>
          <label>
            Apellido
            <input name="lastName" autoComplete="family-name" required />
          </label>
        </>
      )}
      {showEmail && (
        <label>
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required />
        </label>
      )}
      {showPassword && (
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            required
            minLength={mode === 'login' ? 1 : 12}
          />
        </label>
      )}
      {(mode === 'register' || mode === 'update-password') && (
        <label>
          Confirmar contraseña
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
          />
        </label>
      )}
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending
          ? 'Procesando…'
          : mode === 'login'
            ? 'Ingresar'
            : mode === 'register'
              ? 'Crear cuenta'
              : mode === 'recovery'
                ? 'Enviar instrucciones'
                : 'Actualizar contraseña'}
      </Button>
    </form>
  )
}
