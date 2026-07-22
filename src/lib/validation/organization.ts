import { z } from 'zod'

const cleanText = (min: number, max: number) =>
  z.string().trim().min(min).max(max)

export const createCompanySchema = z
  .object({
    legalName: cleanText(2, 200),
    tradeName: cleanText(1, 200).optional(),
    taxId: cleanText(3, 30).optional(),
  })
  .strict()

export const updateProfileSchema = z
  .object({
    firstName: cleanText(1, 100).nullable().optional(),
    lastName: cleanText(1, 100).nullable().optional(),
    displayName: cleanText(1, 160).nullable().optional(),
    phone: cleanText(5, 30).nullable().optional(),
    avatarPath: cleanText(1, 500).nullable().optional(),
    locale: z
      .string()
      .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/)
      .optional(),
    timeZone: cleanText(1, 100).optional(),
  })
  .strict()

export const inviteCompanyMemberSchema = z
  .object({
    companyId: z.uuid(),
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    intendedRoleId: z.uuid().optional(),
  })
  .strict()

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type InviteCompanyMemberInput = z.infer<typeof inviteCompanyMemberSchema>
