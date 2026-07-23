import { appConfig } from '@/config/app'

export type ServiceHealth = 'ok' | 'degraded' | 'unavailable'

export function platformStatus(status: ServiceHealth = 'ok') {
  return {
    status,
    application: appConfig.name,
    version: appConfig.version,
    environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  }
}
