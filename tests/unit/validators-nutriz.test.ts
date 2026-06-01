import { describe, it, expect } from 'vitest'

import {
  nutrizSignupSchema,
  nutrizAdminUpdateSchema,
} from '../../lib/validators/nutriz'

const validSignup = {
  fullName: 'Maria Silva',
  phoneWhatsapp: '11999998888',
  state: 'SP',
  city: 'São Paulo',
  lgpdConsent: true,
}

describe('nutrizSignupSchema', () => {
  it('aceita objeto válido', () => {
    expect(nutrizSignupSchema.safeParse(validSignup).success).toBe(true)
  })

  it('rejeita lgpdConsent false', () => {
    expect(
      nutrizSignupSchema.safeParse({ ...validSignup, lgpdConsent: false })
        .success,
    ).toBe(false)
  })

  it('rejeita lgpdConsent ausente', () => {
    const { lgpdConsent: _omit, ...semConsent } = validSignup
    expect(nutrizSignupSchema.safeParse(semConsent).success).toBe(false)
  })

  it('rejeita nome muito curto', () => {
    expect(
      nutrizSignupSchema.safeParse({ ...validSignup, fullName: 'Ab' }).success,
    ).toBe(false)
  })

  it('rejeita nome muito longo', () => {
    expect(
      nutrizSignupSchema.safeParse({
        ...validSignup,
        fullName: 'a'.repeat(121),
      }).success,
    ).toBe(false)
  })

  it('rejeita estado inválido', () => {
    expect(
      nutrizSignupSchema.safeParse({ ...validSignup, state: 'XX' }).success,
    ).toBe(false)
  })

  it('normaliza WhatsApp', () => {
    expect(nutrizSignupSchema.parse(validSignup).phoneWhatsapp).toBe(
      '5511999998888',
    )
  })
})

describe('nutrizAdminUpdateSchema', () => {
  it('aceita objeto vazio', () => {
    expect(nutrizAdminUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('aceita atualização parcial', () => {
    expect(
      nutrizAdminUpdateSchema.safeParse({ interestStatus: 'CONTACTED' })
        .success,
    ).toBe(true)
  })

  it('rejeita interestStatus inválido', () => {
    expect(
      nutrizAdminUpdateSchema.safeParse({ interestStatus: 'INVALIDO' }).success,
    ).toBe(false)
  })
})
