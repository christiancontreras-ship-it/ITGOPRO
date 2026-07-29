import { describe, expect, it } from 'vitest'
import {
  createTicketSchema,
  publishTicketSchema,
} from '@/lib/validation/ticket'

const valid = {
  companyId: '45f84435-c507-42f6-9f79-77517b2637f0',
  categoryId: '5aed4ba3-666f-407f-9e98-5aca75ad090f',
  title: 'Servidor sin acceso',
  description: 'El servidor principal no permite conexiones remotas.',
  priority: 'critical',
  modality: 'remote',
}
describe('validación de tickets', () => {
  it('acepta un ticket completo', () =>
    expect(createTicketSchema.safeParse(valid).success).toBe(true))
  it('rechaza prioridad y descripción inválidas', () =>
    expect(
      createTicketSchema.safeParse({
        ...valid,
        priority: 'urgent',
        description: 'corta',
      }).success,
    ).toBe(false))
  it('valida el identificador antes de publicar', () => {
    expect(
      publishTicketSchema.safeParse({
        ticketId: '6fa7384f-34fd-4ca5-82a8-0b0ef6245a2d',
      }).success,
    ).toBe(true)
    expect(
      publishTicketSchema.safeParse({ ticketId: 'invalido' }).success,
    ).toBe(false)
  })
})
