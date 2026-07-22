import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  const provided = signature.replace(/^sha256=/, '')
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}
