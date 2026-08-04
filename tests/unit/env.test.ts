import {
  parsePublicEnv,
  parseServerEnv,
  parseSupabaseAdminEnv,
} from '@/config/env'

const valid = {
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
}

describe('environment validation', () => {
  it('acepta configuración pública válida', () =>
    expect(parsePublicEnv(valid)).toEqual(valid))
  it('rechaza secretos incompletos del servidor', () =>
    expect(() => parseServerEnv(valid)).toThrow(/inválida/i))
  it('valida Supabase admin sin exigir integraciones no relacionadas', () =>
    expect(
      parseSupabaseAdminEnv({
        NEXT_PUBLIC_SUPABASE_URL: valid.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: valid.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    }))
})
