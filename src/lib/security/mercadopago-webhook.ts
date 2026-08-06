import { createHmac, timingSafeEqual } from 'node:crypto'

type VerificationInput = {
  dataId: string | null
  requestId: string | null
  signature: string | null
  secret: string
  now?: number
}

export function verifyMercadoPagoWebhook({
  dataId,
  requestId,
  signature,
  secret,
  now = Date.now(),
}: VerificationInput): boolean {
  if (!signature || !requestId || !secret) return false
  const parts = Object.fromEntries(
    signature.split(',').map((part) => {
      const [key, ...value] = part.trim().split('=')
      return [key, value.join('=')]
    }),
  )
  const timestamp = parts.ts
  const provided = parts.v1
  if (!timestamp || !provided) return false

  const numericTimestamp = Number(timestamp)
  if (!Number.isFinite(numericTimestamp)) return false
  const timestampMs =
    numericTimestamp < 10_000_000_000
      ? numericTimestamp * 1000
      : numericTimestamp
  if (Math.abs(now - timestampMs) > 15 * 60 * 1000) return false

  const normalizedId = dataId?.toLowerCase()
  const manifest = `${normalizedId ? `id:${normalizedId};` : ''}request-id:${requestId};ts:${timestamp};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  if (provided.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}
