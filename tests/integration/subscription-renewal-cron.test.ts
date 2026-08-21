const rpc = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({ rpc }),
}))

describe('GET /api/cron/subscription-renewals', () => {
  beforeEach(() => {
    vi.resetModules()
    rpc.mockReset()
    process.env.CRON_SECRET = 'a-secure-test-cron-secret'
  })

  it('rechaza solicitudes sin el secreto', async () => {
    const { GET } = await import('@/app/api/cron/subscription-renewals/route')
    const response = await GET(
      new Request('http://localhost/api/cron/subscription-renewals'),
    )
    expect(response.status).toBe(401)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('procesa renovaciones con autorización válida', async () => {
    rpc.mockResolvedValue({
      data: { reminders_created: 1, subscriptions_expired: 0 },
      error: null,
    })
    const { GET } = await import('@/app/api/cron/subscription-renewals/route')
    const response = await GET(
      new Request('http://localhost/api/cron/subscription-renewals', {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    )
    expect(response.status).toBe(200)
    expect(rpc).toHaveBeenCalledWith('process_subscription_renewals')
  })

  it('no expone el error interno de Supabase', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: 'XX000', message: 'sensitive database detail' },
    })
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const { GET } = await import('@/app/api/cron/subscription-renewals/route')
    const response = await GET(
      new Request('http://localhost/api/cron/subscription-renewals', {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    )
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      error: 'renewal_processing_failed',
    })
    consoleError.mockRestore()
  })
})
