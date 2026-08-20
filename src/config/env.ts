import { z } from 'zod'

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: z.string().min(1),
})

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  APP_ENV: z.enum(['development', 'test', 'staging', 'production']),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
})

const supabaseAdminEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export type PublicEnv = z.infer<typeof publicEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>
export type SupabaseAdminEnv = z.infer<typeof supabaseAdminEnvSchema>

function formatEnvError(error: z.ZodError): Error {
  const fields = error.issues.map((issue) => issue.path.join('.')).join(', ')
  return new Error(`Configuración de entorno inválida. Revisa: ${fields}`)
}

export function parsePublicEnv(
  input: Record<string, string | undefined>,
): PublicEnv {
  const result = publicEnvSchema.safeParse(input)
  if (!result.success) throw formatEnvError(result.error)
  return result.data
}

export function parseServerEnv(
  input: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(input)
  if (!result.success) throw formatEnvError(result.error)
  return result.data
}

export function getPublicEnv(): PublicEnv {
  return parsePublicEnv({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
  })
}

export function getServerEnv(): ServerEnv {
  return parseServerEnv(process.env)
}

export function parseSupabaseAdminEnv(
  input: Record<string, string | undefined>,
): SupabaseAdminEnv {
  const result = supabaseAdminEnvSchema.safeParse(input)
  if (!result.success) throw formatEnvError(result.error)
  return result.data
}

export function getSupabaseAdminEnv(): SupabaseAdminEnv {
  return parseSupabaseAdminEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
}
