'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function requestPayoutAction() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('request_specialist_payout', {
    p_idempotency_key: `payout:${randomUUID()}`,
  })
  if (error) redirect('/specialist/earnings?result=unavailable')
  revalidatePath('/specialist/earnings')
  redirect('/specialist/earnings?result=requested')
}
