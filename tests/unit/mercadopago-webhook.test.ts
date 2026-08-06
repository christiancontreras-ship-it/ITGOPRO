import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyMercadoPagoWebhook } from '@/lib/security/mercadopago-webhook'

describe('verifyMercadoPagoWebhook', () => {
  it('validates the documented Mercado Pago manifest', () => {
    const now = 1_704_908_010_000
    const manifest = 'id:999999999;request-id:req-1;ts:1704908010;'
    const hash = createHmac('sha256', 'secret').update(manifest).digest('hex')
    expect(
      verifyMercadoPagoWebhook({
        dataId: '999999999',
        requestId: 'req-1',
        signature: `ts=1704908010,v1=${hash}`,
        secret: 'secret',
        now,
      }),
    ).toBe(true)
  })

  it('rejects stale or invalid signatures', () => {
    expect(
      verifyMercadoPagoWebhook({
        dataId: '1',
        requestId: 'req',
        signature: 'ts=1,v1=bad',
        secret: 'secret',
      }),
    ).toBe(false)
  })
})
