import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { getOwnSpecialistProfile } from '@/services/specialist-portal.service'

export default async function SpecialistDashboard() {
  const profile = await getOwnSpecialistProfile()
  if (!profile)
    return (
      <main className="dashboard-shell">
        <p className="eyebrow">Portal especialista</p>
        <h1>Activa tu perfil profesional</h1>
        <Card>
          <p>
            Completa tus capacidades, tarifa y disponibilidad para iniciar el
            proceso de aprobación.
          </p>
          <Link className="button" href="/specialist/profile">
            Crear perfil
          </Link>
        </Card>
      </main>
    )
  return (
    <main className="dashboard-shell">
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">Portal especialista</p>
          <h1>{profile.public_name}</h1>
          <p>{profile.professional_title}</p>
        </div>
        <span className="plan-badge">{profile.approval_status}</span>
      </section>
      <section className="metric-grid">
        <Card>
          <span>Rating</span>
          <strong>{profile.rating_average.toFixed(1)}</strong>
        </Card>
        <Card>
          <span>Servicios</span>
          <strong>{profile.completed_services}</strong>
        </Card>
        <Card>
          <span>Invitaciones</span>
          <strong>0</strong>
        </Card>
        <Card>
          <span>Disponibilidad</span>
          <strong className="metric-word">{profile.availability_status}</strong>
        </Card>
      </section>
      <Card>
        <h2>Estado de incorporación</h2>
        <p>
          {profile.approval_status === 'approved'
            ? 'Tu perfil es visible en el marketplace.'
            : 'Tu perfil está pendiente de revisión por ITGO.'}
        </p>
      </Card>
    </main>
  )
}
