import { ApplicationForm } from '@/components/specialist/application-form'
import { Card } from '@/components/ui/card'
import { listPublishedTickets } from '@/services/application.service'

export default async function OpportunitiesPage() {
  const tickets = await listPublishedTickets()
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">Marketplace operativo</p>
      <h1>Oportunidades publicadas</h1>
      {tickets.length === 0 ? (
        <Card>
          <p>No hay tickets compatibles publicados.</p>
        </Card>
      ) : (
        tickets.map((ticket) => (
          <Card key={ticket.id}>
            <span className="ticket-code">{ticket.code}</span>
            <h2>{ticket.title}</h2>
            <p>{ticket.description}</p>
            <ApplicationForm ticketId={ticket.id} />
          </Card>
        ))
      )}
    </main>
  )
}
