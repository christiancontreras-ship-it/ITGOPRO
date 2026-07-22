import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addTicketCommentAction } from '@/app/app/tickets/actions'
import { Card } from '@/components/ui/card'
import { getTicket } from '@/services/ticket.service'

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const ticket = await getTicket(ticketId)
  if (!ticket) notFound()
  const category =
    ticket.ticket_categories && !Array.isArray(ticket.ticket_categories)
      ? ticket.ticket_categories.name
      : 'Sin categoría'
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">{ticket.code}</p>
      <h1>{ticket.title}</h1>
      {ticket.status === 'published' && (
        <Link className="button" href={`/app/tickets/${ticket.id}/candidates`}>
          Revisar candidatos
        </Link>
      )}
      <section className="ticket-detail-grid">
        <Card>
          <dl>
            <dt>Estado</dt>
            <dd>{ticket.status}</dd>
            <dt>Prioridad</dt>
            <dd>{ticket.priority}</dd>
            <dt>Categoría</dt>
            <dd>{category}</dd>
            <dt>SLA resolución</dt>
            <dd>
              {new Date(ticket.resolution_due_at).toLocaleString('es-CL')}
            </dd>
          </dl>
          <h2>Descripción</h2>
          <p className="preserve-lines">{ticket.description}</p>
        </Card>
        <Card>
          <h2>Historial</h2>
          <ol className="timeline">
            {ticket.ticket_status_history.map((event) => (
              <li key={event.id}>
                <strong>{event.to_status}</strong>
                <small>
                  {new Date(event.created_at).toLocaleString('es-CL')}
                </small>
              </li>
            ))}
          </ol>
        </Card>
      </section>
      <Card>
        <h2>Comentarios</h2>
        {ticket.ticket_comments.map((comment) => (
          <p key={comment.id}>{comment.body}</p>
        ))}
        <form action={addTicketCommentAction} className="comment-form">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <textarea
            name="body"
            required
            maxLength={5000}
            placeholder="Agregar comentario"
          />
          <ButtonLabel />
        </form>
      </Card>
    </main>
  )
}
function ButtonLabel() {
  return (
    <button className="button" type="submit">
      Comentar
    </button>
  )
}
