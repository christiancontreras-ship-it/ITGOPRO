import { describe, expect, it } from 'vitest'
import { specialistProfileSchema } from '@/lib/validation/specialist'
const valid = {
  publicName: 'Ana Cloud',
  professionalTitle: 'Arquitecta Cloud',
  bio: 'Especialista con experiencia en plataformas cloud y continuidad operacional.',
  yearsExperience: 10,
  hourlyRate: 60000,
  modality: 'remote',
  availabilityStatus: 'available',
  skillIds: ['45f84435-c507-42f6-9f79-77517b2637f0'],
}
describe('perfil especialista', () => {
  it('acepta un perfil completo', () =>
    expect(specialistProfileSchema.safeParse(valid).success).toBe(true))
  it('exige al menos una especialidad', () =>
    expect(
      specialistProfileSchema.safeParse({ ...valid, skillIds: [] }).success,
    ).toBe(false))
})
