import { describe, expect, it } from 'vitest'
import { ticketReviewSchema } from '@/lib/validation/ticket'

const validReview = {
  ticketId: '3b051f9c-db35-4b02-a4f4-aad33fbce630',
  rating: 5,
  technicalRating: 5,
  communicationRating: 4,
  comment: 'Servicio completado correctamente.',
  isPublic: true,
}

describe('ticketReviewSchema', () => {
  it('accepts a valid service review', () => {
    expect(ticketReviewSchema.safeParse(validReview).success).toBe(true)
  })

  it('rejects ratings outside the 1 to 5 range', () => {
    expect(
      ticketReviewSchema.safeParse({ ...validReview, rating: 6 }).success,
    ).toBe(false)
  })

  it('rejects comments longer than 2000 characters', () => {
    expect(
      ticketReviewSchema.safeParse({
        ...validReview,
        comment: 'a'.repeat(2001),
      }).success,
    ).toBe(false)
  })
})
