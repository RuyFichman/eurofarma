import { describe, it, expect } from 'vitest'

import {
  nutrizLoginSchema,
  nutrizPasswordResetSchema,
  nutrizNewPasswordSchema,
} from '../../lib/validators/nutriz-auth'

describe('nutrizLoginSchema', () => {
  const valid = { email: 'maria@email.com', password: 'senha-forte-123' }

  it('aceita credenciais válidas', () => {
    expect(nutrizLoginSchema.safeParse(valid).success).toBe(true)
  })

  it('normaliza o e-mail (trim + minúsculas)', () => {
    expect(
      nutrizLoginSchema.parse({ ...valid, email: '  Maria@Email.com ' }).email,
    ).toBe('maria@email.com')
  })

  it('rejeita e-mail inválido', () => {
    expect(
      nutrizLoginSchema.safeParse({ ...valid, email: 'nao-email' }).success,
    ).toBe(false)
  })

  it('rejeita senha vazia', () => {
    expect(
      nutrizLoginSchema.safeParse({ ...valid, password: '' }).success,
    ).toBe(false)
  })

  it('rejeita senha curta demais para existir no cadastro', () => {
    expect(
      nutrizLoginSchema.safeParse({ ...valid, password: '1234567' }).success,
    ).toBe(false)
  })
})

describe('nutrizPasswordResetSchema', () => {
  it('aceita só o e-mail', () => {
    expect(
      nutrizPasswordResetSchema.safeParse({ email: 'maria@email.com' }).success,
    ).toBe(true)
  })

  it('rejeita e-mail ausente', () => {
    expect(nutrizPasswordResetSchema.safeParse({}).success).toBe(false)
  })

  it('rejeita e-mail vazio', () => {
    expect(nutrizPasswordResetSchema.safeParse({ email: '' }).success).toBe(
      false,
    )
  })
})

describe('nutrizNewPasswordSchema', () => {
  const valid = {
    password: 'senha-nova-123',
    passwordConfirm: 'senha-nova-123',
  }

  it('aceita senhas iguais e válidas', () => {
    expect(nutrizNewPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita senhas diferentes apontando o erro na confirmação', () => {
    const result = nutrizNewPasswordSchema.safeParse({
      ...valid,
      passwordConfirm: 'outra-senha-123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['passwordConfirm'])
    }
  })

  // Os limites precisam bater com os do cadastro e do login: senha aceita aqui
  // e recusada lá deixaria a pessoa trancada fora da própria conta.
  it('usa os mesmos limites de tamanho do cadastro', () => {
    expect(
      nutrizNewPasswordSchema.safeParse({
        password: '1234567',
        passwordConfirm: '1234567',
      }).success,
    ).toBe(false)

    const limite = 'a'.repeat(128)
    expect(
      nutrizNewPasswordSchema.safeParse({
        password: limite,
        passwordConfirm: limite,
      }).success,
    ).toBe(true)

    const acima = 'a'.repeat(129)
    expect(
      nutrizNewPasswordSchema.safeParse({
        password: acima,
        passwordConfirm: acima,
      }).success,
    ).toBe(false)
  })
})
