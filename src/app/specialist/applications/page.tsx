import { Card } from '@/components/ui/card'
import { listOwnApplications } from '@/services/application.service'

export default async function ApplicationsPage() {
  const applications = await listOwnApplications()
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Portal especialista</p>
      <h1>Mis postulaciones</h1>
      <Card>
        {applications.length === 0 ? (
          <p>Aún no has enviado propuestas.</p>
        ) : (
          <div className="data-list">
            {applications.map((application) => (
              <article key={application.id}>
                <div>
                  <strong>{application.tickets?.code}</strong>
                  <p>{application.tickets?.title}</p>
                </div>
                <span className="plan-badge">{application.status}</span>
                <strong>
                  {application.currency_code}{' '}
                  {application.amount.toLocaleString('es-CL')}
                </strong>
              </article>
            ))}
          </div>
        )}
      </Card>
    </main>
  )
}
