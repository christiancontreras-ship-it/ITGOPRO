import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getManagedServices(companyId: string) {
  const supabase = await createSupabaseServerClient()
  const [{ data: catalog }, { data: services, error }] = await Promise.all([
    supabase.from('managed_service_catalog').select('*').order('monthly_price'),
    supabase
      .from('managed_services')
      .select(
        '*,managed_service_catalog(name,code),specialist_profiles(public_name)',
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false }),
  ])
  if (error) throw error
  return { catalog: catalog ?? [], services: services ?? [] }
}
