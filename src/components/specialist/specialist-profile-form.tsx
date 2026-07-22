'use client'
import { useActionState } from 'react'
import { saveSpecialistProfileAction } from '@/app/specialist/actions'
import { Button } from '@/components/ui/button'
import type { SpecialistActionState } from '@/lib/validation/specialist'

type Skill = { id: string; name: string; category: string }
type Profile = {
  public_name: string
  professional_title: string
  bio: string
  years_experience: number
  hourly_rate: number
  modality: string
  availability_status: string
  specialist_skills: { skill_id: string }[]
} | null
const initial: SpecialistActionState = { status: 'idle' }
export function SpecialistProfileForm({
  skills,
  profile,
}: {
  skills: Skill[]
  profile: Profile
}) {
  const [state, action, pending] = useActionState(
    saveSpecialistProfileAction,
    initial,
  )
  const selected = new Set(
    profile?.specialist_skills.map((item) => item.skill_id) ?? [],
  )
  return (
    <form action={action} className="ticket-form">
      <div className="form-row">
        <label>
          Nombre público
          <input
            name="publicName"
            defaultValue={profile?.public_name}
            required
          />
        </label>
        <label>
          Título profesional
          <input
            name="professionalTitle"
            defaultValue={profile?.professional_title}
            required
          />
        </label>
      </div>
      <label>
        Biografía
        <textarea
          name="bio"
          defaultValue={profile?.bio}
          minLength={40}
          rows={6}
          required
        />
      </label>
      <div className="form-row">
        <label>
          Años de experiencia
          <input
            name="yearsExperience"
            type="number"
            min={0}
            max={70}
            defaultValue={profile?.years_experience ?? 0}
          />
        </label>
        <label>
          Tarifa por hora (CLP)
          <input
            name="hourlyRate"
            type="number"
            min={1}
            defaultValue={profile?.hourly_rate ?? 35000}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Modalidad
          <select name="modality" defaultValue={profile?.modality ?? 'remote'}>
            <option value="remote">Remoto</option>
            <option value="onsite">Presencial</option>
            <option value="hybrid">Híbrido</option>
          </select>
        </label>
        <label>
          Disponibilidad
          <select
            name="availabilityStatus"
            defaultValue={profile?.availability_status ?? 'unavailable'}
          >
            <option value="available">Disponible</option>
            <option value="busy">Ocupado</option>
            <option value="unavailable">No disponible</option>
          </select>
        </label>
      </div>
      <fieldset className="skill-selector">
        <legend>Especialidades</legend>
        {skills.map((skill) => (
          <label key={skill.id}>
            <input
              type="checkbox"
              name="skillIds"
              value={skill.id}
              defaultChecked={selected.has(skill.id)}
            />
            <span>
              {skill.name}
              <small>{skill.category}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {state.message && (
        <p role="status" className={`form-message ${state.status}`}>
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar perfil'}
      </Button>
    </form>
  )
}
