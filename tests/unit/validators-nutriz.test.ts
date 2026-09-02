import { describe, it, expect } from 'vitest'

import {
  nutrizSignupSchema,
  nutrizSignupApiSchema,
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

// Sprint 6.2: o cadastro passou a criar conta, então e-mail e senha entraram
// no payload do endpoint público e são obrigatórios no servidor.
const validApiSignup = {
  ...validSignup,
  email: 'Maria.Silva@Email.com',
  password: 'senha-forte-123',
}

describe('nutrizSignupApiSchema', () => {
  it('aceita payload válido com e-mail e senha', () => {
    expect(nutrizSignupApiSchema.safeParse(validApiSignup).success).toBe(true)
  })

  it('normaliza o e-mail para minúsculas', () => {
    expect(nutrizSignupApiSchema.parse(validApiSignup).email).toBe(
      'maria.silva@email.com',
    )
  })

  it('rejeita e-mail ausente', () => {
    const { email: _omit, ...semEmail } = validApiSignup
    expect(nutrizSignupApiSchema.safeParse(semEmail).success).toBe(false)
  })

  it('rejeita e-mail inválido', () => {
    expect(
      nutrizSignupApiSchema.safeParse({ ...validApiSignup, email: 'nao-email' })
        .success,
    ).toBe(false)
  })

  it('rejeita senha ausente', () => {
    const { password: _omit, ...semSenha } = validApiSignup
    expect(nutrizSignupApiSchema.safeParse(semSenha).success).toBe(false)
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    expect(
      nutrizSignupApiSchema.safeParse({
        ...validApiSignup,
        password: '1234567',
      }).success,
    ).toBe(false)
  })

  it('rejeita senha com mais de 128 caracteres', () => {
    expect(
      nutrizSignupApiSchema.safeParse({
        ...validApiSignup,
        password: 'a'.repeat(129),
      }).success,
    ).toBe(false)
  })

  it('rejeita consentimento LGPD ausente mesmo com conta válida', () => {
    const { lgpdConsent: _omit, ...semConsent } = validApiSignup
    expect(nutrizSignupApiSchema.safeParse(semConsent).success).toBe(false)
  })

  it('normaliza WhatsApp e UF junto com a conta', () => {
    const parsed = nutrizSignupApiSchema.parse({
      ...validApiSignup,
      phoneWhatsapp: '(11) 99999-8888',
      state: 'sp',
    })
    expect(parsed.phoneWhatsapp).toBe('5511999998888')
    expect(parsed.state).toBe('SP')
  })
})
