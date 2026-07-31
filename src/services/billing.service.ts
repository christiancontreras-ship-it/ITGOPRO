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

export async function getPayableTickets(companyId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('id,code,title,final_cost,payments(id,status,provider)')
    .eq('company_id', companyId)
    .eq('status', 'closed')
    .not('final_cost', 'is', null)
    .order('closed_at', { ascending: false })
  if (error) throw error
  return (data ?? []).filter(
    (ticket) =>
      !ticket.payments.some((payment) => payment.status === 'captured'),
  )
}
