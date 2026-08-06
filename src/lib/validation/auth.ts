import { z } from 'zod'

const email = z.string().trim().toLowerCase().email().max(254)
const password = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres.')
  .max(128)
  .regex(/[a-z]/, 'Incluye una minúscula.')
  .regex(/[A-Z]/, 'Incluye una mayúscula.')
  .regex(/[0-9]/, 'Incluye un número.')

export const loginSchema = z
  .object({ email, password: z.string().min(1).max(128) })
  .strict()

export const registerSchema = z
  .object({
    accountType: z.enum(['company', 'specialist'], {
      message: 'Selecciona si te registras como empresa o especialista TI.',
    }),
    email,
    password,
    confirmPassword: z.string(),
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export const recoverySchema = z.object({ email }).strict()

export const updatePasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type AuthActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export const accountTypeSchema = z.enum(['company', 'specialist'])
export type AccountType = z.infer<typeof accountTypeSchema>
