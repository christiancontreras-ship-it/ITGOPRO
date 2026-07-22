import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getCurrentAuthContext() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims.sub) return null

  const userId = data.claims.sub
  const [{ data: profile }, { data: memberships }, { data: platformRoles }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase
        .from('company_memberships')
        .select(
          'id, company_id, status, companies(id, legal_name, trade_name), membership_roles(roles(code, name, scope_type))',
        )
        .eq('user_id', userId)
        .eq('status', 'active')
        .is('deleted_at', null),
      supabase
        .from('platform_user_roles')
        .select('roles(code, name, scope_type)')
        .eq('user_id', userId)
        .is('revoked_at', null),
    ])

  return {
    userId,
    email: data.claims.email,
    profile,
    memberships: memberships ?? [],
    platformRoles: platformRoles ?? [],
  }
}
