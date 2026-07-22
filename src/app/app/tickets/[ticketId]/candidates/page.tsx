import { selectCandidateAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { listTicketCandidates } from '@/services/application.service'

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const candidates = await listTicketCandidates(ticketId)
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Selección segura</p>
      <h1>Candidatos del ticket</h1>
      {candidates.length === 0 ? (
        <Card>
          <p>No se han recibido propuestas.</p>
        </Card>
      ) : (
        candidates.map((candidate) => (
          <Card key={candidate.id}>
            <div className="dashboard-heading">
              <div>
                <h2>{candidate.specialist_profiles?.public_name}</h2>
                <p>{candidate.specialist_profiles?.professional_title}</p>
              </div>
              <span className="plan-badge">{candidate.status}</span>
            </div>
            <p>{candidate.solution_summary}</p>
            <strong>
              {candidate.currency_code}{' '}
              {candidate.amount.toLocaleString('es-CL')}
            </strong>
            {['submitted', 'under_review', 'shortlisted'].includes(
              candidate.status,
            ) && (
              <form action={selectCandidateAction}>
                <input type="hidden" name="ticketId" value={ticketId} />
                <input
                  type="hidden"
                  name="applicationId"
                  value={candidate.id}
                />
                <Button type="submit">Seleccionar especialista</Button>
              </form>
            )}
          </Card>
        ))
      )}
    </main>
  )
}
