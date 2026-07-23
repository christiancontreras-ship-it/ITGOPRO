import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'
export async function getPartnerPortal(companyId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: partner, error } = await supabase
    .from('partner_profiles')
    .select(
      '*,partner_specialists(status,specialist_profiles(public_name,professional_title,rating_average)),partner_clients(status,companies(legal_name,trade_name))',
    )
    .eq('company_id', companyId)
    .maybeSingle()
  if (error) throw error
  return partner
}
