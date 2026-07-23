import { describe, expect, it } from 'vitest'
import { platformStatus } from '@/lib/operations/health'

describe('platformStatus', () => {
  it('returns versioned, non-sensitive health data', () => {
    expect(platformStatus()).toMatchObject({
      application: 'ITGO',
      version: '1.0.0',
      status: 'ok',
    })
  })
})
