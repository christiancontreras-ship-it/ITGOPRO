import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get('companyId')
  if (!companyId)
    return NextResponse.json({ error: 'companyId_required' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('analytics_daily_company_metrics')
    .select('*')
    .eq('company_id', companyId)
    .order('metric_date', { ascending: false })
    .limit(366)
  if (error) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ schemaVersion: '1.0', companyId, data })
}
