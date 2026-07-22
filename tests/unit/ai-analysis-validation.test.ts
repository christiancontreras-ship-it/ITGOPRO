import { describe, expect, it } from 'vitest'
import { aiAnalysisSchema } from '@/lib/validation/ai-analysis'

describe('aiAnalysisSchema', () => {
  it('valida una respuesta estructurada', () =>
    expect(
      aiAnalysisSchema.safeParse({
        categoryCode: 'linux',
        suggestedPriority: 'high',
        complexity: 'high',
        estimatedHours: 3,
        estimatedCost: 120000,
        technicalSummary:
          'Diagnóstico técnico controlado con revisión de acceso y servicios.',
        recommendedActions: ['Revisar logs'],
        riskFlags: ['Disponibilidad'],
      }).success,
    ).toBe(true))
  it('rechaza prioridades inventadas', () =>
    expect(
      aiAnalysisSchema.safeParse({
        categoryCode: 'linux',
        suggestedPriority: 'urgent',
        complexity: 'high',
        estimatedHours: 3,
        estimatedCost: 120000,
        technicalSummary:
          'Diagnóstico técnico controlado con revisión de acceso y servicios.',
        recommendedActions: [],
        riskFlags: [],
      }).success,
    ).toBe(false))
})
