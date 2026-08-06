'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { accountTypeSchema, type AuthActionState } from '@/lib/validation/auth'
import {
  companyOnboardingSchema,
  type CompanyOnboardingState,
} from '@/lib/validation/company-onboarding'

export async function selectAccountTypeAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = accountTypeSchema.safeParse(formData.get('accountType'))
  if (!parsed.success)
    return { status: 'error', message: 'Selecciona un tipo de cuenta.' }

  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) redirect('/auth/login')

  const { error } = await supabase
    .from('profiles')
    .update({ account_type: parsed.data })
    .eq('id', claims.claims.sub)

  if (error)
    return { status: 'error', message: 'No fue posible guardar tu selección.' }

  redirect(
    parsed.data === 'specialist'
      ? '/specialist/profile'
      : '/app/onboarding/company',
  )
}

export async function createCompanyAction(
  _state: CompanyOnboardingState,
  formData: FormData,
): Promise<CompanyOnboardingState> {
  const parsed = companyOnboardingSchema.safeParse({
    legalName: formData.get('legalName'),
    tradeName: formData.get('tradeName') || undefined,
    taxId: formData.get('taxId') || undefined,
  })
  if (!parsed.success)
    return { status: 'error', message: 'Revisa los datos de la empresa.' }
  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) redirect('/auth/login')
  const { error } = await supabase.rpc('create_company_with_owner', {
    legal_name: parsed.data.legalName,
    trade_name: parsed.data.tradeName,
    tax_id: parsed.data.taxId,
  })
  if (error)
    return { status: 'error', message: 'No fue posible crear la empresa.' }
  return { status: 'success' }
}
