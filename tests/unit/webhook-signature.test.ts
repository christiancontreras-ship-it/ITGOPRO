import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyWebhookSignature } from '@/lib/security/webhook-signature'
describe('verifyWebhookSignature', () => {
  it('acepta HMAC válido', () => {
    const body = '{"status":"critical"}',
      secret = 'test-secret',
      signature = createHmac('sha256', secret).update(body).digest('hex')
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true)
  })
  it('rechaza firma alterada', () =>
    expect(verifyWebhookSignature('body', 'bad', 'secret')).toBe(false))
})
