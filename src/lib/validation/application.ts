import { z } from 'zod'

export const ticketApplicationSchema = z
  .object({
    ticketId: z.string().uuid(),
    billingType: z.enum(['fixed', 'hourly', 'daily', 'monthly']),
    amount: z.coerce.number().positive().max(999_999_999),
    estimatedHours: z.coerce.number().positive().max(10_000).optional(),
    availableFrom: z.coerce.date(),
    estimatedEndAt: z.coerce.date(),
    modality: z.enum(['remote', 'onsite', 'hybrid']),
    solutionSummary: z.string().trim().min(40).max(5000),
    assumptions: z.string().trim().max(3000).optional(),
    exclusions: z.string().trim().max(3000).optional(),
    warranty: z.string().trim().max(2000).optional(),
    validUntil: z.coerce.date(),
  })
  .strict()
  .refine((value) => value.estimatedEndAt > value.availableFrom, {
    message: 'La fecha de término debe ser posterior al inicio.',
    path: ['estimatedEndAt'],
  })

export type ApplicationActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}
