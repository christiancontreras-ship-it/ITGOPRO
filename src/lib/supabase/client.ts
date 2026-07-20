'use client'

import { createBrowserClient } from '@supabase/ssr'

import { getPublicEnv } from '@/config/env'
import type { Database } from '@/types/database'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

export function getSupabaseBrowserClient(): ReturnType<
  typeof createBrowserClient<Database>
> {
  const env = getPublicEnv()
  browserClient ??= createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
  return browserClient
}
