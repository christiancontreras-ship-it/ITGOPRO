import {
  AppError,
  AuthorizationError,
  ValidationError,
} from '@/lib/errors/app-error'

describe('application errors', () => {
  it('expone códigos y estados seguros', () => {
    expect(new ValidationError('Dato inválido')).toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    })
    expect(new AuthorizationError()).toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: 401,
    })
    expect(new AppError('Error')).toBeInstanceOf(Error)
  })
})
