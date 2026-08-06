import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get('paymentId') ?? ''
  if (!/^[0-9a-f-]{36}$/i.test(paymentId))
    return NextResponse.redirect(
      new URL('/app/billing?payment=invalid', request.url),
    )
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('payments')
    .select('provider_reference,provider_redirect_url,status')
    .eq('id', paymentId)
    .eq('provider', 'transbank')
    .single()
  if (
    !data?.provider_reference ||
    !data.provider_redirect_url ||
    data.status !== 'pending'
  )
    return NextResponse.redirect(
      new URL('/app/billing?payment=unavailable', request.url),
    )
  const token = escapeAttribute(data.provider_reference)
  const url = escapeAttribute(data.provider_redirect_url)
  return new NextResponse(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Redirigiendo a Webpay</title></head><body><main><p>Conectando de forma segura con Webpay...</p><form id="webpay" method="post" action="${url}"><input type="hidden" name="token_ws" value="${token}"><button type="submit">Continuar a Webpay</button></form></main><script>document.getElementById('webpay').submit()</script></body></html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy':
          "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; form-action https://webpay3gint.transbank.cl https://webpay3g.transbank.cl",
      },
    },
  )
}
