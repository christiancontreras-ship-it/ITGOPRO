'use client'

import { useActionState, useEffect } from 'react'
import { createCompanyAction } from '@/app/app/onboarding/actions'
import { Button } from '@/components/ui/button'
import type { CompanyOnboardingState } from '@/lib/validation/company-onboarding'

const initialState: CompanyOnboardingState = { status: 'idle' }
export function CompanyOnboardingForm() {
  const [state, action, pending] = useActionState(
    createCompanyAction,
    initialState,
  )
  useEffect(() => {
    if (state.status === 'success') window.location.assign('/app')
  }, [state.status])
  return (
    <form action={action} className="auth-form">
      <label>
        Razón social
        <input name="legalName" required minLength={2} maxLength={180} />
      </label>
      <label>
        Nombre de fantasía
        <input name="tradeName" maxLength={180} />
      </label>
      <label>
        RUT o identificador tributario
        <input name="taxId" maxLength={30} />
      </label>
      {state.message && (
        <p className="form-message error" role="alert">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Creando empresa…' : 'Crear empresa'}
      </Button>
    </form>
  )
}
