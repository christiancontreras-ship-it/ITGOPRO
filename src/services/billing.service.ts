import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getCompanyBilling(companyId: string) {
  const supabase = await createSupabaseServerClient()
  const [{ data: plans }, { data: payments, error }] = await Promise.all([
    supabase.from('plans').select('*').eq('audience', 'company').order('price'),
    supabase
      .from('payments')
      .select(
        'id,amount,currency_code,status,provider,created_at,tickets(code,title)',
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false }),
  ])
  if (error) throw error
  return { plans: plans ?? [], payments: payments ?? [] }
}
