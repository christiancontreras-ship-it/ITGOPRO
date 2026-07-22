import { z } from 'zod'

export const companyOnboardingSchema = z
  .object({
    legalName: z.string().trim().min(2).max(180),
    tradeName: z.string().trim().max(180).optional(),
    taxId: z.string().trim().max(30).optional(),
  })
  .strict()
export type CompanyOnboardingState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}
