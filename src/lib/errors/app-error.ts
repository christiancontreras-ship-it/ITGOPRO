export type AppErrorCode =
  'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'INTERNAL_ERROR'

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode = 'INTERNAL_ERROR',
    public readonly statusCode = 500,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'AuthorizationError'
  }
}
