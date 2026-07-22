import { notFound, redirect } from 'next/navigation'
import { toggleFavoriteAction } from '@/app/app/marketplace/actions'
import { Card } from '@/components/ui/card'
import { getCurrentAuthContext } from '@/services/auth.service'
import { getSpecialist } from '@/services/marketplace.service'

export default async function SpecialistPage({
  params,
}: {
  params: Promise<{ specialistId: string }>
}) {
  const { specialistId } = await params
  const [context, specialist] = await Promise.all([
    getCurrentAuthContext(),
    getSpecialist(specialistId),
  ])
  if (!context) redirect('/auth/login')
  if (!specialist) notFound()
  const companyId = context.memberships[0]?.company_id
  const skills = specialist.specialist_skills.flatMap((item) =>
    Array.isArray(item.skills) ? item.skills : item.skills ? [item.skills] : [],
  )
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Especialista verificado</p>
      <section className="profile-hero">
        <div>
          <h1>{specialist.public_name}</h1>
          <p>{specialist.professional_title}</p>
        </div>
        <strong>★ {specialist.rating_average.toFixed(1)}</strong>
      </section>
      <section className="ticket-detail-grid">
        <Card>
          <h2>Perfil</h2>
          <p>{specialist.bio}</p>
          <h2>Especialidades</h2>
          <div className="skill-chips">
            {skills.map((skill) => (
              <span key={skill.name}>{skill.name}</span>
            ))}
          </div>
          <h2>Certificaciones</h2>
          {specialist.specialist_certifications.length ? (
            <ul>
              {specialist.specialist_certifications.map((c) => (
                <li key={`${c.name}-${c.issuer}`}>
                  {c.name} · {c.issuer}
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin certificaciones públicas.</p>
          )}
        </Card>
        <Card>
          <h2>Condiciones</h2>
          <p>
            Tarifa referencial: {specialist.currency_code}{' '}
            {specialist.hourly_rate.toLocaleString('es-CL')}/hora
          </p>
          <p>Modalidad: {specialist.modality}</p>
          <p>Disponibilidad: {specialist.availability_status}</p>
          {companyId && (
            <form action={toggleFavoriteAction}>
              <input type="hidden" name="companyId" value={companyId} />
              <input type="hidden" name="specialistId" value={specialist.id} />
              <button className="button button-secondary" type="submit">
                Guardar o quitar favorito
              </button>
            </form>
          )}
        </Card>
      </section>
    </main>
  )
}
