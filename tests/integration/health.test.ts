import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('responde sin datos internos', async () => {
    const response = GET()
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      status: 'ok',
      application: 'ITGO',
      version: '1.0.0',
    })
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(JSON.stringify(body)).not.toMatch(/key|secret|database/i)
  })
})
