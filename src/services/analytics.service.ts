import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'
export async function getCompanyAnalytics(companyId: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.rpc('refresh_company_daily_metrics', {
    p_company_id: companyId,
    p_date: new Date().toISOString().slice(0, 10),
  })
  const [{ data: metrics, error }, { data: goals }] = await Promise.all([
    supabase
      .from('analytics_daily_company_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('metric_date', { ascending: false })
      .limit(90),
    supabase
      .from('analytics_goals')
      .select('*')
      .eq('company_id', companyId)
      .order('period_start', { ascending: false }),
  ])
  if (error) throw error
  return { metrics: metrics ?? [], goals: goals ?? [] }
}
