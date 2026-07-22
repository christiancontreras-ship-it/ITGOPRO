import {
  normalizeDomain,
  normalizeEmail,
  normalizeTaxId,
} from '@/lib/utils/normalization'

describe('normalización fundacional', () => {
  it('normaliza correo, dominio y RUT sin conservar formato decorativo', () => {
    expect(normalizeEmail(' Usuario@Empresa.CL ')).toBe('usuario@empresa.cl')
    expect(normalizeDomain(' Portal.Empresa.CL. ')).toBe('portal.empresa.cl')
    expect(normalizeTaxId('76.123.456-k')).toBe('76123456K')
  })
})
