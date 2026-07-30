import { z } from 'zod'

export const createTicketSchema = z
  .object({
    companyId: z.uuid(),
    categoryId: z.uuid(),
    title: z.string().trim().min(5).max(160),
    description: z.string().trim().min(10).max(10_000),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    modality: z.enum(['remote', 'onsite', 'hybrid']),
  })
  .strict()
export const ticketCommentSchema = z
  .object({ ticketId: z.uuid(), body: z.string().trim().min(1).max(5000) })
  .strict()
export const publishTicketSchema = z.object({ ticketId: z.uuid() }).strict()
export const closeTicketSchema = z.object({ ticketId: z.uuid() }).strict()
export type TicketActionState = { status: 'idle' | 'error'; message?: string }
