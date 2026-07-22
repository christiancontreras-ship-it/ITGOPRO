import { describe, expect, it } from 'vitest'

import {
  loginSchema,
  recoverySchema,
  registerSchema,
} from '@/lib/validation/auth'

describe('validación de autenticación', () => {
  it('normaliza el correo al iniciar sesión', () => {
    const result = loginSchema.parse({
      email: ' USER@Example.COM ',
      password: 'secret',
    })
    expect(result.email).toBe('user@example.com')
  })

  it('exige una contraseña robusta y confirmada al registrar', () => {
    const weak = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'débil',
      confirmPassword: 'débil',
      firstName: 'Ana',
      lastName: 'Pérez',
    })
    const mismatch = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'ClaveSegura123',
      confirmPassword: 'OtraClave123',
      firstName: 'Ana',
      lastName: 'Pérez',
    })
    expect(weak.success).toBe(false)
    expect(mismatch.success).toBe(false)
  })

  it('acepta recuperación únicamente con correo válido', () => {
    expect(recoverySchema.safeParse({ email: 'persona@itgo.cl' }).success).toBe(
      true,
    )
    expect(recoverySchema.safeParse({ email: 'no-es-correo' }).success).toBe(
      false,
    )
  })
})
