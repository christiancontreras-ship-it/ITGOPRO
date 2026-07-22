'use client'

import { useActionState } from 'react'
import { createTicketAction } from '@/app/app/tickets/actions'
import { Button } from '@/components/ui/button'
import type { TicketActionState } from '@/lib/validation/ticket'

type Category = { id: string; name: string }
const initialState: TicketActionState = { status: 'idle' }
export function TicketForm({
  companyId,
  categories,
}: {
  companyId: string
  categories: Category[]
}) {
  const [state, action, pending] = useActionState(
    createTicketAction,
    initialState,
  )
  return (
    <form action={action} className="ticket-form">
      <input type="hidden" name="companyId" value={companyId} />
      <label>
        Título
        <input name="title" required minLength={5} maxLength={160} />
      </label>
      <label>
        Categoría
        <select name="categoryId" required>
          <option value="">Selecciona</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="form-row">
        <label>
          Prioridad
          <select name="priority" defaultValue="medium">
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </label>
        <label>
          Modalidad
          <select name="modality" defaultValue="remote">
            <option value="remote">Remoto</option>
            <option value="onsite">Presencial</option>
            <option value="hybrid">Híbrido</option>
          </select>
        </label>
      </div>
      <label>
        Descripción
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={10000}
          rows={8}
        />
      </label>
      {state.message && (
        <p className="form-message error" role="alert">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Creando…' : 'Crear ticket'}
      </Button>
    </form>
  )
}
