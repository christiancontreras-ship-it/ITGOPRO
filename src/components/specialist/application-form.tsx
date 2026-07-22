'use client'

import { useActionState } from 'react'
import { submitApplicationAction } from '@/app/specialist/opportunities/actions'
import { Button } from '@/components/ui/button'
import type { ApplicationActionState } from '@/lib/validation/application'

const initial: ApplicationActionState = { status: 'idle' }

export function ApplicationForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState(
    submitApplicationAction,
    initial,
  )
  return (
    <form action={action} className="ticket-form application-form">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div className="form-row">
        <label>
          Tipo de cobro
          <select name="billingType">
            <option value="fixed">Precio fijo</option>
            <option value="hourly">Por hora</option>
            <option value="daily">Por jornada</option>
            <option value="monthly">Mensual</option>
          </select>
        </label>
        <label>
          Monto CLP
          <input name="amount" type="number" min="1" required />
        </label>
        <label>
          Horas estimadas
          <input name="estimatedHours" type="number" min="1" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Inicio disponible
          <input name="availableFrom" type="datetime-local" required />
        </label>
        <label>
          Término estimado
          <input name="estimatedEndAt" type="datetime-local" required />
        </label>
        <label>
          Vigencia
          <input name="validUntil" type="datetime-local" required />
        </label>
      </div>
      <label>
        Modalidad
        <select name="modality">
          <option value="remote">Remoto</option>
          <option value="onsite">Presencial</option>
          <option value="hybrid">Híbrido</option>
        </select>
      </label>
      <label>
        Solución propuesta
        <textarea name="solutionSummary" minLength={40} rows={5} required />
      </label>
      <label>
        Supuestos
        <textarea name="assumptions" rows={2} />
      </label>
      <label>
        Exclusiones
        <textarea name="exclusions" rows={2} />
      </label>
      <label>
        Garantía
        <textarea name="warranty" rows={2} />
      </label>
      {state.message && (
        <p role="status" className={`form-message ${state.status}`}>
          {state.message}
        </p>
      )}
      <Button disabled={pending} type="submit">
        {pending ? 'Enviando…' : 'Enviar propuesta'}
      </Button>
    </form>
  )
}
