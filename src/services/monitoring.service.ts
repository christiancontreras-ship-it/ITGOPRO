import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'
export async function getMonitoringOverview(companyId: string) {
  const supabase = await createSupabaseServerClient()
  const [{ data: assets }, { data: alerts, error }] = await Promise.all([
    supabase
      .from('monitoring_assets')
      .select('*')
      .eq('company_id', companyId)
      .order('name'),
    supabase
      .from('monitoring_alerts')
      .select('*,monitoring_assets!inner(name,company_id)')
      .eq('monitoring_assets.company_id', companyId)
      .order('occurred_at', { ascending: false })
      .limit(20),
  ])
  if (error) throw error
  return { assets: assets ?? [], alerts: alerts ?? [] }
}
