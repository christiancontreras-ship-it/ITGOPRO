'use server'

import { redirect } from 'next/navigation'

import { getPublicEnv } from '@/config/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  type AuthActionState,
  loginSchema,
  recoverySchema,
  registerSchema,
  updatePasswordSchema,
} from '@/lib/validation/auth'

const invalidCredentials =
  'No fue posible iniciar sesión con esas credenciales.'

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success)
    return { status: 'error', message: 'Revisa el correo y la contraseña.' }
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { status: 'error', message: invalidCredentials }
  redirect('/app')
}

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
  })
  if (!parsed.success)
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
    }
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      },
    },
  })
  if (error)
    return { status: 'error', message: 'No fue posible crear la cuenta.' }
  return {
    status: 'success',
    message: 'Cuenta creada. Revisa tu correo para confirmar el acceso.',
  }
}

export async function recoveryAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = recoverySchema.safeParse({ email: formData.get('email') })
  if (!parsed.success)
    return { status: 'error', message: 'Ingresa un correo válido.' }
  const supabase = await createSupabaseServerClient()
  const { NEXT_PUBLIC_APP_URL } = getPublicEnv()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password`,
  })
  return {
    status: 'success',
    message:
      'Si la cuenta existe, recibirás instrucciones para recuperar el acceso.',
  }
}

export async function updatePasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success)
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Contraseña inválida.',
    }
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error)
    return {
      status: 'error',
      message: 'No fue posible actualizar la contraseña.',
    }
  return { status: 'success', message: 'Contraseña actualizada.' }
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function oauthAction(formData: FormData) {
  const provider = formData.get('provider')
  if (provider !== 'google' && provider !== 'azure')
    redirect('/auth/login?error=provider')
  const supabase = await createSupabaseServerClient()
  const { NEXT_PUBLIC_APP_URL } = getPublicEnv()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${NEXT_PUBLIC_APP_URL}/auth/callback`,
      scopes: provider === 'azure' ? 'email openid profile' : undefined,
    },
  })
  if (error || !data.url) redirect('/auth/login?error=oauth')
  redirect(data.url)
}
