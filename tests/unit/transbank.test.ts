import { describe, expect, it } from 'vitest'

import { buildTransbankBuyOrder } from '@/lib/payments/transbank'

describe('Transbank Webpay Plus', () => {
  it('genera una orden de compra estable y dentro del máximo de Webpay', () => {
    const paymentId = '123e4567-e89b-12d3-a456-426614174000'
    const buyOrder = buildTransbankBuyOrder(paymentId)

    expect(buyOrder).toBe('ITGO123e4567e89b12d3a45642')
    expect(buyOrder.length).toBeLessThanOrEqual(26)
  })
})
