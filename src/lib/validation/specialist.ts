import { z } from 'zod'

export const specialistProfileSchema = z
  .object({
    publicName: z.string().trim().min(2).max(120),
    professionalTitle: z.string().trim().min(3).max(160),
    bio: z.string().trim().min(40).max(2000),
    yearsExperience: z.coerce.number().int().min(0).max(70),
    hourlyRate: z.coerce.number().positive().max(10_000_000),
    modality: z.enum(['remote', 'onsite', 'hybrid']),
    availabilityStatus: z.enum(['available', 'busy', 'unavailable']),
    skillIds: z.array(z.uuid()).min(1),
  })
  .strict()
export type SpecialistActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}
