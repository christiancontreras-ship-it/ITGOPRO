import { generateMatchesAction, selectCandidateAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  listLatestMatches,
  listTicketCandidates,
} from '@/services/application.service'

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const [candidates, matches] = await Promise.all([
    listTicketCandidates(ticketId),
    listLatestMatches(ticketId),
  ])
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Selección segura</p>
      <h1>Candidatos del ticket</h1>
      <Card>
        <div className="dashboard-heading">
          <div>
            <h2>Matching explicable</h2>
            <p>Ranking orientativo; la selección requiere decisión humana.</p>
          </div>
          <form action={generateMatchesAction}>
            <input type="hidden" name="ticketId" value={ticketId} />
            <Button type="submit">Calcular compatibilidad</Button>
          </form>
        </div>
        {matches.length > 0 && (
          <ol className="timeline">
            {matches.map((match) => (
              <li key={match.id}>
                <strong>
                  #{match.rank} {match.specialist_profiles?.public_name}
                </strong>
                <span>{match.total_score}/100</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
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
