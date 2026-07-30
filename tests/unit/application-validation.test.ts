import { describe, expect, it } from 'vitest'
import {
  assignmentResponseSchema,
  resolveAssignmentSchema,
  startAssignmentSchema,
  ticketApplicationSchema,
} from '@/lib/validation/application'

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

describe('assignment schemas', () => {
  const assignmentId = 'c1d6ec28-151f-4ee7-8ffc-99bce89fa9d3'

  it('valida aceptar o rechazar una asignación', () => {
    expect(
      assignmentResponseSchema.safeParse({
        assignmentId,
        decision: 'accept',
      }).success,
    ).toBe(true)
    expect(
      assignmentResponseSchema.safeParse({
        assignmentId,
        decision: 'reject',
        reason: 'No tengo disponibilidad.',
      }).success,
    ).toBe(true)
  })

  it('valida el inicio de un trabajo asignado', () => {
    expect(startAssignmentSchema.safeParse({ assignmentId }).success).toBe(true)
  })

  it('exige un resumen suficiente para resolver', () => {
    expect(
      resolveAssignmentSchema.safeParse({
        ticketId: assignmentId,
        resolutionSummary:
          'Se aplicó la actualización y se validó el reinicio del sistema.',
      }).success,
    ).toBe(true)
    expect(
      resolveAssignmentSchema.safeParse({
        ticketId: assignmentId,
        resolutionSummary: 'Listo',
      }).success,
    ).toBe(false)
  })
})
