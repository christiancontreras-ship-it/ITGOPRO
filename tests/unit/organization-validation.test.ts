import {
  createCompanySchema,
  inviteCompanyMemberSchema,
  updateProfileSchema,
} from '@/lib/validation/organization'

describe('validación organizacional', () => {
  it('acepta una empresa válida y rechaza campos inesperados', () => {
    expect(createCompanySchema.parse({ legalName: 'ITGO SpA' }).legalName).toBe(
      'ITGO SpA',
    )
    expect(() =>
      createCompanySchema.parse({ legalName: 'ITGO SpA', admin: true }),
    ).toThrow()
  })

  it('normaliza el correo de invitación', () => {
    const result = inviteCompanyMemberSchema.parse({
      companyId: '62ccab02-4757-44a7-9150-e7e97eed5e12',
      email: ' Persona@Empresa.cl ',
    })
    expect(result.email).toBe('persona@empresa.cl')
  })

  it('impide actualizar campos administrativos del perfil', () => {
    expect(() =>
      updateProfileSchema.parse({ profileStatus: 'active' }),
    ).toThrow()
  })
})
