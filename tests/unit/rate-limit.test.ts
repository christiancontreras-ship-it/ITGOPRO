import { beforeEach, describe, expect, it } from 'vitest'
import { clearRateLimits, consumeRateLimit } from '@/lib/security/rate-limit'
describe('consumeRateLimit', () => {
  beforeEach(clearRateLimits)
  it('bloquea al superar el límite', () => {
    expect(consumeRateLimit('a', 2, 1000, 0).allowed).toBe(true)
    expect(consumeRateLimit('a', 2, 1000, 1).allowed).toBe(true)
    expect(consumeRateLimit('a', 2, 1000, 2).allowed).toBe(false)
  })
  it('restablece la ventana', () => {
    consumeRateLimit('a', 1, 10, 0)
    expect(consumeRateLimit('a', 1, 10, 10).allowed).toBe(true)
  })
})
