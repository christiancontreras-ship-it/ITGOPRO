import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function listSpecialists(search?: string) {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from('specialist_profiles')
    .select(
      'id,public_name,professional_title,bio,years_experience,hourly_rate,currency_code,modality,availability_status,plan_code,rating_average,reviews_count,completed_services,specialist_skills(proficiency,skills(name))',
    )
    .eq('approval_status', 'approved')
    .is('deleted_at', null)
    .order('rating_average', { ascending: false })
  if (search)
    query = query.or(
      `public_name.ilike.%${search.replace(/[%_,]/g, '')}%,professional_title.ilike.%${search.replace(/[%_,]/g, '')}%`,
    )
  const { data, error } = await query.limit(50)
  if (error) throw error
  return data ?? []
}
export async function getSpecialist(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('specialist_profiles')
    .select(
      '*,specialist_skills(proficiency,years_experience,skills(name,category)),specialist_certifications(name,issuer,status,issued_at,expires_at),specialist_reviews(rating,technical_rating,communication_rating,comment,created_at)',
    )
    .eq('id', id)
    .single()
  return data
}
