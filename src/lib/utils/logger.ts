type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogContext = Record<string, unknown>

const blockedKeys = /secret|token|password|authorization|api.?key/i

function sanitize(context?: LogContext): LogContext | undefined {
  if (!context) return undefined
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      blockedKeys.test(key) ? '[REDACTED]' : value,
    ]),
  )
}

function write(level: LogLevel, message: string, context?: LogContext): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development',
    context: sanitize(context),
  }
  const output = JSON.stringify(entry)
  if (level === 'error') console.error(output)
  else if (level === 'warn') console.warn(output)
  else console.info(output)
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    write('debug', message, context),
  info: (message: string, context?: LogContext) =>
    write('info', message, context),
  warn: (message: string, context?: LogContext) =>
    write('warn', message, context),
  error: (message: string, context?: LogContext) =>
    write('error', message, context),
}
