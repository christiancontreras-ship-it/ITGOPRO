'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function approvePayoutAction(formData: FormData) {
  const payoutId = String(formData.get('payoutId') ?? '')
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('approve_specialist_payout', {
    p_payout_id: payoutId,
  })
  if (error) redirect('/app/finance/payouts?result=error')
  revalidatePath('/app/finance/payouts')
  redirect('/app/finance/payouts?result=approved')
}

export async function recordPayoutTransferAction(formData: FormData) {
  const payoutId = String(formData.get('payoutId') ?? '')
  const bankReference = String(formData.get('bankReference') ?? '').trim()
  const proofReference = String(formData.get('proofReference') ?? '').trim()
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('record_specialist_payout_transfer', {
    p_payout_id: payoutId,
    p_bank_reference: bankReference,
    p_proof_reference: proofReference || undefined,
  })
  if (error) redirect('/app/finance/payouts?result=error')
  revalidatePath('/app/finance/payouts')
  redirect('/app/finance/payouts?result=paid')
}
