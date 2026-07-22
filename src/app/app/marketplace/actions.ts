'use server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function toggleFavoriteAction(formData: FormData) {
  const companyId = String(formData.get('companyId') ?? '')
  const specialistId = String(formData.get('specialistId') ?? '')
  if (!companyId || !specialistId) return
  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) return
  const { data } = await supabase
    .from('company_favorite_specialists')
    .select('specialist_id')
    .eq('company_id', companyId)
    .eq('specialist_id', specialistId)
    .maybeSingle()
  if (data)
    await supabase
      .from('company_favorite_specialists')
      .delete()
      .eq('company_id', companyId)
      .eq('specialist_id', specialistId)
  else
    await supabase.from('company_favorite_specialists').insert({
      company_id: companyId,
      specialist_id: specialistId,
      created_by: claims.claims.sub,
    })
  revalidatePath('/app/marketplace')
}
