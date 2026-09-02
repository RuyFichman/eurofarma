import { describe, it, expect } from 'vitest'

import { signupFormSchema } from '../../lib/validators/signup-form'

/**
 * Schema do formulário público (`SignupForm`, Client Component). É o par
 * cliente do `nutrizSignupApiSchema`: as regras precisam bater, senão a nutriz
 * passa pela validação do browser e leva erro do servidor. A diferença
 * deliberada é o `passwordConfirm`, que só existe aqui.
 */
const validForm = {
  fullName: 'Maria Silva',
  email: 'maria@email.com',
  phoneWhatsapp: '(11) 99999-8888',
  state: 'SP',
  city: 'São Paulo',
  password: 'senha-forte-123',
  passwordConfirm: 'senha-forte-123',
  lgpdConsent: true,
}

describe('signupFormSchema', () => {
  it('aceita formulário válido', () => {
    expect(signupFormSchema.safeParse(validForm).success).toBe(true)
  })

  it('normaliza e-mail e UF', () => {
    const parsed = signupFormSchema.parse({
      ...validForm,
      email: '  Maria@Email.com ',
      state: 'sp',
    })
    expect(parsed.email).toBe('maria@email.com')
    expect(parsed.state).toBe('SP')
  })

  it('rejeita senhas diferentes e aponta o erro na confirmação', () => {
    const result = signupFormSchema.safeParse({
      ...validForm,
      passwordConfirm: 'outra-senha-123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['passwordConfirm'])
    }
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    expect(
      signupFormSchema.safeParse({
        ...validForm,
        password: '1234567',
        passwordConfirm: '1234567',
      }).success,
    ).toBe(false)
  })

  it('rejeita e-mail inválido', () => {
    expect(
      signupFormSchema.safeParse({ ...validForm, email: 'nao-email' }).success,
    ).toBe(false)
  })

  it('rejeita consentimento não marcado', () => {
    expect(
      signupFormSchema.safeParse({ ...validForm, lgpdConsent: false }).success,
    ).toBe(false)
  })

  it('rejeita WhatsApp inválido', () => {
    expect(
      signupFormSchema.safeParse({ ...validForm, phoneWhatsapp: '123' })
        .success,
    ).toBe(false)
  })

  it('rejeita UF inexistente', () => {
    expect(
      signupFormSchema.safeParse({ ...validForm, state: 'XX' }).success,
    ).toBe(false)
  })

  it('aceita as mesmas regras de senha do schema do servidor', () => {
    const longa = 'a'.repeat(128)
    expect(
      signupFormSchema.safeParse({
        ...validForm,
        password: longa,
        passwordConfirm: longa,
      }).success,
    ).toBe(true)

    const longaDemais = 'a'.repeat(129)
    expect(
      signupFormSchema.safeParse({
        ...validForm,
        password: longaDemais,
        passwordConfirm: longaDemais,
      }).success,
    ).toBe(false)
  })
})
