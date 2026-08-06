import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getOwnPayoutOverview(specialistId: string) {
  const supabase = await createSupabaseServerClient()
  const [
    { data: commissions, error: commissionError },
    { data: payouts, error: payoutError },
  ] = await Promise.all([
    supabase
      .from('commissions')
      .select('id,specialist_amount,status,created_at')
      .eq('specialist_id', specialistId)
      .order('created_at', { ascending: false }),
    supabase
      .from('specialist_payouts')
      .select(
        'id,amount,currency_code,status,bank_reference,requested_at,approved_at,paid_at',
      )
      .eq('specialist_id', specialistId)
      .order('created_at', { ascending: false }),
  ])
  if (commissionError) throw commissionError
  if (payoutError) throw payoutError
  return {
    available: (commissions ?? [])
      .filter((item) => item.status === 'available')
      .reduce((sum, item) => sum + Number(item.specialist_amount), 0),
    held: (commissions ?? [])
      .filter((item) => item.status === 'held')
      .reduce((sum, item) => sum + Number(item.specialist_amount), 0),
    paid: (commissions ?? [])
      .filter((item) => item.status === 'paid')
      .reduce((sum, item) => sum + Number(item.specialist_amount), 0),
    payouts: payouts ?? [],
  }
}

export async function getAdminPayouts() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('specialist_payouts')
    .select(
      'id,amount,currency_code,status,bank_reference,proof_reference,requested_at,approved_at,paid_at,specialist_profiles(public_name,professional_title)',
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
