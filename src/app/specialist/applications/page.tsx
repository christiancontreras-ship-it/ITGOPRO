import { respondAssignmentAction, startAssignmentAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  listOwnApplications,
  listOwnAssignments,
} from '@/services/application.service'

export default async function ApplicationsPage() {
  const [applications, assignments] = await Promise.all([
    listOwnApplications(),
    listOwnAssignments(),
  ])

  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Portal especialista</p>
      <h1>Mis postulaciones</h1>
      <Card>
        <h2>Asignaciones</h2>
        {assignments.length === 0 ? (
          <p>No tienes asignaciones pendientes.</p>
        ) : (
          <div className="data-list">
            {assignments.map((assignment) => (
              <article key={assignment.id}>
                <div>
                  <strong>{assignment.tickets?.code}</strong>
                  <p>{assignment.tickets?.title}</p>
                </div>
                <span className="plan-badge">{assignment.status}</span>
                {assignment.status === 'pending_acceptance' && (
                  <div className="assignment-actions">
                    <form action={respondAssignmentAction}>
                      <input
                        type="hidden"
                        name="assignmentId"
                        value={assignment.id}
                      />
                      <input type="hidden" name="decision" value="accept" />
                      <Button type="submit">Aceptar asignación</Button>
                    </form>
                    <form action={respondAssignmentAction}>
                      <input
                        type="hidden"
                        name="assignmentId"
                        value={assignment.id}
                      />
                      <input type="hidden" name="decision" value="reject" />
                      <label>
                        Motivo del rechazo
                        <input name="reason" maxLength={1000} />
                      </label>
                      <Button type="submit">Rechazar</Button>
                    </form>
                  </div>
                )}
                {assignment.status === 'accepted' && (
                  <form action={startAssignmentAction}>
                    <input
                      type="hidden"
                      name="assignmentId"
                      value={assignment.id}
                    />
                    <Button type="submit">Iniciar trabajo</Button>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <h2>Propuestas</h2>
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
