import Link from 'next/link'
import { notFound } from 'next/navigation'
import { analyzeTicketAction } from './ai-actions'
import {
  addTicketCommentAction,
  closeTicketAction,
  publishTicketAction,
} from '@/app/app/tickets/actions'
import { Card } from '@/components/ui/card'
import { TicketChat } from '@/components/tickets/ticket-chat'
import { getTicket } from '@/services/ticket.service'

export default async function TicketDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ticketId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { ticketId } = await params
  const { error } = await searchParams
  const ticket = await getTicket(ticketId)
  if (!ticket) notFound()
  const latestAnalysis = ticket.ticket_ai_analyses[0]
  const category =
    ticket.ticket_categories && !Array.isArray(ticket.ticket_categories)
      ? ticket.ticket_categories.name
      : 'Sin categoría'
  return (
    <main className="dashboard-shell">
      <p className="eyebrow">{ticket.code}</p>
      <h1>{ticket.title}</h1>
      {error === 'publish' && (
        <p className="form-message error" role="alert">
          No fue posible publicar el ticket. Recarga la página e inténtalo
          nuevamente.
        </p>
      )}
      {error === 'close' && (
        <p className="form-message error" role="alert">
          No fue posible cerrar el ticket. Verifica que siga resuelto.
        </p>
      )}
      {ticket.status === 'new' && (
        <form action={publishTicketAction}>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <button className="button" type="submit">
            Publicar ticket
          </button>
        </form>
      )}
      {ticket.status === 'published' && (
        <Link className="button" href={`/app/tickets/${ticket.id}/candidates`}>
          Revisar candidatos
        </Link>
      )}
      {ticket.status === 'resolved' && (
        <form action={closeTicketAction}>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <button className="button" type="submit">
            Confirmar cierre
          </button>
        </form>
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
          {ticket.resolution_summary && (
            <>
              <h2>Resolución informada</h2>
              <p className="preserve-lines">{ticket.resolution_summary}</p>
            </>
          )}
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
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Claude</p>
            <h2>Análisis técnico asistido</h2>
          </div>
          <form action={analyzeTicketAction}>
            <input type="hidden" name="ticketId" value={ticket.id} />
            <button className="button" type="submit">
              Analizar ticket
            </button>
          </form>
        </div>
        {!latestAnalysis ? (
          <p>Aún no existe un análisis IA.</p>
        ) : (
          <div>
            <p>{latestAnalysis.technical_summary}</p>
            <dl>
              <dt>Complejidad</dt>
              <dd>{latestAnalysis.complexity}</dd>
              <dt>Horas estimadas</dt>
              <dd>{latestAnalysis.estimated_hours}</dd>
              <dt>Costo sugerido</dt>
              <dd>
                CLP {latestAnalysis.estimated_cost?.toLocaleString('es-CL')}
              </dd>
            </dl>
          </div>
        )}
      </Card>
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
      {['assigned', 'in_progress', 'waiting_customer', 'resolved'].includes(
        ticket.status,
      ) && (
        <Card>
          <h2>Chat del servicio</h2>
          <TicketChat
            ticketId={ticket.id}
            initialMessages={ticket.ticket_messages}
          />
        </Card>
      )}
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
