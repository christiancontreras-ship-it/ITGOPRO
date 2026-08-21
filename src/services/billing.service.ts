import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getCompanyBilling(companyId: string) {
  const supabase = await createSupabaseServerClient()
  const [
    { data: plans },
    { data: payments, error },
    { data: subscriptions },
    { data: renewalEvents },
  ] = await Promise.all([
    supabase.from('plans').select('*').eq('audience', 'company').order('price'),
    supabase
      .from('payments')
      .select(
        'id,amount,currency_code,status,provider,provider_reference,subscription_id,subscription_period_start,subscription_period_end,captured_at,created_at,tickets(code,title),company_subscriptions(plans(name,code))',
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false }),
    supabase
      .from('company_subscriptions')
      .select(
        'id,status,current_period_end,plan_id,plans(name,code,commission_percent)',
      )
      .eq('company_id', companyId)
      .in('status', ['pending', 'authorized', 'paused', 'expired'])
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('subscription_renewal_events')
      .select('id,event_type,period_end,metadata,created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(20),
  ])
  if (error) throw error
  return {
    plans: plans ?? [],
    payments: payments ?? [],
    subscription: subscriptions?.[0] ?? null,
    renewalEvents: renewalEvents ?? [],
  }
}

export async function getCompanyPaymentReceipt(
  companyId: string,
  paymentId: string,
) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('payments')
    .select(
      'id,amount,currency_code,status,provider,provider_reference,subscription_period_start,subscription_period_end,captured_at,created_at,company_subscriptions(id,plans(name,code)),companies(legal_name,trade_name,tax_id)',
    )
    .eq('id', paymentId)
    .eq('company_id', companyId)
    .not('subscription_id', 'is', null)
    .maybeSingle()
  if (error) throw error
  return data
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
