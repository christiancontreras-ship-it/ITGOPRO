import { describe, expect, it } from 'vitest'
import { ticketApplicationSchema } from '@/lib/validation/application'

describe('ticketApplicationSchema', () => {
  it('acepta una propuesta coherente', () => {
    const start = new Date(Date.now() + 86_400_000)
    expect(
      ticketApplicationSchema.safeParse({
        ticketId: crypto.randomUUID(),
        billingType: 'fixed',
        amount: 100000,
        estimatedHours: 4,
        availableFrom: start,
        estimatedEndAt: new Date(start.getTime() + 14_400_000),
        modality: 'remote',
        solutionSummary:
          'Diagnóstico, corrección controlada y documentación del resultado final.',
        validUntil: new Date(Date.now() + 43_200_000),
      }).success,
    ).toBe(true)
  })
  it('rechaza una fecha de término anterior', () => {
    const start = new Date(Date.now() + 86_400_000)
    expect(
      ticketApplicationSchema.safeParse({
        ticketId: crypto.randomUUID(),
        billingType: 'fixed',
        amount: 100000,
        availableFrom: start,
        estimatedEndAt: new Date(start.getTime() - 1),
        modality: 'remote',
        solutionSummary:
          'Diagnóstico, corrección controlada y documentación del resultado final.',
        validUntil: new Date(Date.now() + 43_200_000),
      }).success,
    ).toBe(false)
  })
})
