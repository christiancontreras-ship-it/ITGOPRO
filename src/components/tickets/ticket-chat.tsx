'use client'

import { useEffect, useRef, useState } from 'react'
import { sendTicketMessageAction } from '@/app/app/tickets/[ticketId]/chat/actions'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Message = {
  id: string
  body: string
  sender_id: string
  created_at: string
}

export function TicketChat({
  ticketId,
  initialMessages,
}: {
  ticketId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState(initialMessages)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          const message = payload.new as Message
          setMessages((current) =>
            current.some((item) => item.id === message.id)
              ? current
              : [...current, message],
          )
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [ticketId])
  async function send(formData: FormData) {
    const result = await sendTicketMessageAction(formData)
    if (!result?.error) formRef.current?.reset()
  }
  return (
    <section className="ticket-chat">
      <div className="chat-messages" aria-live="polite">
        {messages.length === 0 ? (
          <p>No hay mensajes todavía.</p>
        ) : (
          messages.map((message) => (
            <article key={message.id}>
              <p>{message.body}</p>
              <small>
                {new Date(message.created_at).toLocaleString('es-CL')}
              </small>
            </article>
          ))
        )}
      </div>
      <form ref={formRef} action={send} className="comment-form">
        <input type="hidden" name="ticketId" value={ticketId} />
        <textarea
          name="body"
          aria-label="Nuevo mensaje"
          maxLength={5000}
          required
        />
        <Button type="submit">Enviar mensaje</Button>
      </form>
    </section>
  )
}
