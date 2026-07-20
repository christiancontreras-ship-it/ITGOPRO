import { NextResponse } from 'next/server'

import { AppError } from '@/lib/errors/app-error'
import { logger } from '@/lib/utils/logger'

export function errorResponse(
  error: unknown,
  requestId?: string,
): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message }, requestId },
      { status: error.statusCode },
    )
  }

  logger.error('Error de API no controlado', { requestId })
  return NextResponse.json(
    {
      error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado' },
      requestId,
    },
    { status: 500 },
  )
}
