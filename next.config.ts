import type { NextConfig } from 'next'

const scriptSources =
  process.env.NODE_ENV === 'development'
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com"
    : "'self' 'unsafe-inline' https://sdk.mercadopago.com"

const mercadoPagoSources =
  'https://api.mercadopago.com https://*.mercadopago.com https://*.mercadopago.cl https://*.mlstatic.com'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src ${scriptSources}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.mercadopago.com https://*.mercadopago.cl https://*.mlstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com ${mercadoPagoSources}; frame-src https://*.mercadopago.com https://*.mercadopago.cl https://*.mlstatic.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

export default nextConfig
