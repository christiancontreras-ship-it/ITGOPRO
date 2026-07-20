import { NextResponse } from 'next/server'

import { appConfig } from '@/config/app'

export type HealthStatus = 'ok' | 'degraded' | 'unavailable'

export function GET(): NextResponse {
  return NextResponse.json({
    status: 'ok' satisfies HealthStatus,
    application: appConfig.name,
    version: appConfig.version,
    environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  })
}
