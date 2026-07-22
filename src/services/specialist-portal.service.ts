import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getOwnSpecialistProfile() {
  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) return null
  const { data } = await supabase
    .from('specialist_profiles')
    .select(
      '*,specialist_skills(skill_id,proficiency,years_experience,skills(name)),specialist_certifications(*),specialist_availability(*)',
    )
    .eq('user_id', claims.claims.sub)
    .maybeSingle()
  return data
}
export async function listSkills() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('skills')
    .select('id,name,category')
    .eq('is_active', true)
    .order('category')
    .order('name')
  return data ?? []
}
