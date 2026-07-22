import Link from 'next/link'
import { Card } from '@/components/ui/card'

type Specialist = {
  id: string
  public_name: string
  professional_title: string
  bio: string
  hourly_rate: number
  currency_code: string
  modality: string
  availability_status: string
  plan_code: string
  rating_average: number
  completed_services: number
  specialist_skills: {
    proficiency: string
    skills: { name: string } | { name: string }[] | null
  }[]
}
export function SpecialistCard({ specialist }: { specialist: Specialist }) {
  const skills = specialist.specialist_skills
    .flatMap((item) =>
      Array.isArray(item.skills)
        ? item.skills
        : item.skills
          ? [item.skills]
          : [],
    )
    .slice(0, 4)
  return (
    <Card className="specialist-card">
      <div className="specialist-card-head">
        <div className="avatar-placeholder">
          {specialist.public_name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2>{specialist.public_name}</h2>
          <p>{specialist.professional_title}</p>
        </div>
        <span className="plan-badge">{specialist.plan_code}</span>
      </div>
      <p>
        {specialist.bio.slice(0, 150)}
        {specialist.bio.length > 150 ? '…' : ''}
      </p>
      <div className="skill-chips">
        {skills.map((skill) => (
          <span key={skill.name}>{skill.name}</span>
        ))}
      </div>
      <dl>
        <div>
          <dt>Rating</dt>
          <dd>★ {specialist.rating_average.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Servicios</dt>
          <dd>{specialist.completed_services}</dd>
        </div>
        <div>
          <dt>Desde</dt>
          <dd>
            {specialist.currency_code}{' '}
            {specialist.hourly_rate.toLocaleString('es-CL')}
          </dd>
        </div>
      </dl>
      <Link
        className="button button-secondary"
        href={`/app/marketplace/${specialist.id}`}
      >
        Ver perfil
      </Link>
    </Card>
  )
}
