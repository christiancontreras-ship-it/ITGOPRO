'use server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  type SpecialistActionState,
  specialistProfileSchema,
} from '@/lib/validation/specialist'

export async function saveSpecialistProfileAction(
  _state: SpecialistActionState,
  formData: FormData,
): Promise<SpecialistActionState> {
  const parsed = specialistProfileSchema.safeParse({
    publicName: formData.get('publicName'),
    professionalTitle: formData.get('professionalTitle'),
    bio: formData.get('bio'),
    yearsExperience: formData.get('yearsExperience'),
    hourlyRate: formData.get('hourlyRate'),
    modality: formData.get('modality'),
    availabilityStatus: formData.get('availabilityStatus'),
    skillIds: formData.getAll('skillIds'),
  })
  if (!parsed.success)
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Perfil inválido.',
    }
  const supabase = await createSupabaseServerClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub)
    return { status: 'error', message: 'Sesión no válida.' }
  const { data: existing } = await supabase
    .from('specialist_profiles')
    .select('id')
    .eq('user_id', claims.claims.sub)
    .maybeSingle()
  let specialistId = existing?.id
  if (specialistId) {
    const { error } = await supabase
      .from('specialist_profiles')
      .update({
        public_name: parsed.data.publicName,
        professional_title: parsed.data.professionalTitle,
        bio: parsed.data.bio,
        years_experience: parsed.data.yearsExperience,
        hourly_rate: parsed.data.hourlyRate,
        modality: parsed.data.modality,
        availability_status: parsed.data.availabilityStatus,
      })
      .eq('id', specialistId)
    if (error)
      return {
        status: 'error',
        message: 'No fue posible actualizar el perfil.',
      }
    await supabase
      .from('specialist_skills')
      .delete()
      .eq('specialist_id', specialistId)
  } else {
    const { data, error } = await supabase
      .from('specialist_profiles')
      .insert({
        user_id: claims.claims.sub,
        public_name: parsed.data.publicName,
        professional_title: parsed.data.professionalTitle,
        bio: parsed.data.bio,
        years_experience: parsed.data.yearsExperience,
        hourly_rate: parsed.data.hourlyRate,
        modality: parsed.data.modality,
        availability_status: parsed.data.availabilityStatus,
      })
      .select('id')
      .single()
    if (error || !data)
      return { status: 'error', message: 'No fue posible crear el perfil.' }
    specialistId = data.id
  }
  const { error: skillsError } = await supabase
    .from('specialist_skills')
    .insert(
      parsed.data.skillIds.map((skillId) => ({
        specialist_id: specialistId!,
        skill_id: skillId,
        proficiency: 'advanced' as const,
        years_experience: parsed.data.yearsExperience,
      })),
    )
  if (skillsError)
    return {
      status: 'error',
      message: 'El perfil se guardó, pero fallaron las especialidades.',
    }
  return { status: 'success', message: 'Perfil guardado y enviado a revisión.' }
}
