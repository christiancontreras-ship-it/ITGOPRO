import { z } from 'zod'

export const aiAnalysisSchema = z.object({
  categoryCode: z.string().trim().min(1).max(80),
  suggestedPriority: z.enum(['low', 'medium', 'high', 'critical']),
  complexity: z.enum(['low', 'medium', 'high', 'expert']),
  estimatedHours: z.number().positive().max(10_000),
  estimatedCost: z.number().nonnegative().max(999_999_999),
  technicalSummary: z.string().trim().min(20).max(4000),
  recommendedActions: z.array(z.string().trim().min(1).max(500)).max(10),
  riskFlags: z.array(z.string().trim().min(1).max(500)).max(10),
})

export type AiAnalysis = z.infer<typeof aiAnalysisSchema>
