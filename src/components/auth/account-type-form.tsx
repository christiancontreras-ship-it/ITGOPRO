'use client'

import { useActionState } from 'react'

import { selectAccountTypeAction } from '@/app/app/onboarding/actions'
import { Button } from '@/components/ui/button'
import type { AuthActionState } from '@/lib/validation/auth'

const initialState: AuthActionState = { status: 'idle' }

export function AccountTypeForm() {
  const [state, action, pending] = useActionState(
    selectAccountTypeAction,
    initialState,
  )

  return (
    <form action={action} className="auth-form">
      <fieldset className="account-type-selector">
        <legend>Tipo de cuenta</legend>
        <label>
          <input name="accountType" type="radio" value="company" required />
          <span>
            <strong>Empresa</strong>
            <small>Crear tickets y contratar especialistas TI.</small>
          </span>
        </label>
        <label>
          <input name="accountType" type="radio" value="specialist" required />
          <span>
            <strong>Especialista TI</strong>
            <small>Crear tu perfil y ofrecer servicios profesionales.</small>
          </span>
        </label>
      </fieldset>
      {state.message && (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Continuar'}
      </Button>
    </form>
  )
}
