import { describe, it, expect } from 'vitest'

import {
  ufSchema,
  whatsappSchema,
  phoneSchema,
  cepSchema,
  emailSchema,
  stringNotEmptySchema,
} from '../../lib/validators/common'

describe('ufSchema', () => {
  it('aceita UFs válidas', () => {
    expect(ufSchema.parse('SP')).toBe('SP')
    expect(ufSchema.parse('RJ')).toBe('RJ')
    expect(ufSchema.parse('DF')).toBe('DF')
  })

  it('rejeita UF inexistente', () => {
    expect(ufSchema.safeParse('XX').success).toBe(false)
  })

  it('rejeita UF em minúsculas', () => {
    expect(ufSchema.safeParse('sp').success).toBe(false)
  })

  it('rejeita string vazia', () => {
    expect(ufSchema.safeParse('').success).toBe(false)
  })
})

describe('whatsappSchema', () => {
  it('normaliza número com formatação', () => {
    expect(whatsappSchema.parse('(11) 99999-8888')).toBe('5511999998888')
  })

  it('normaliza número sem código do país', () => {
    expect(whatsappSchema.parse('11999998888')).toBe('5511999998888')
  })

  it('mantém número já com código do país', () => {
    expect(whatsappSchema.parse('5511999998888')).toBe('5511999998888')
  })

  it('rejeita número muito curto', () => {
    expect(whatsappSchema.safeParse('123').success).toBe(false)
  })

  it('rejeita string vazia', () => {
    expect(whatsappSchema.safeParse('').success).toBe(false)
  })
})

describe('phoneSchema', () => {
  it('normaliza fixo com formatação', () => {
    expect(phoneSchema.parse('(11) 3333-4444')).toBe('1133334444')
  })

  it('aceita celular de 11 dígitos', () => {
    expect(phoneSchema.parse('11999998888')).toBe('11999998888')
  })

  it('rejeita poucos dígitos', () => {
    expect(phoneSchema.safeParse('12345').success).toBe(false)
  })
})

describe('cepSchema', () => {
  it('formata CEP sem máscara', () => {
    expect(cepSchema.parse('05508000')).toBe('05508-000')
  })

  it('mantém CEP já mascarado', () => {
    expect(cepSchema.parse('05508-000')).toBe('05508-000')
  })

  it('rejeita CEP curto', () => {
    expect(cepSchema.safeParse('123').success).toBe(false)
  })

  it('rejeita CEP com 9 dígitos', () => {
    expect(cepSchema.safeParse('12345-6789').success).toBe(false)
  })
})

describe('emailSchema', () => {
  it('normaliza para minúsculas', () => {
    expect(emailSchema.parse('Teste@EXAMPLE.com')).toBe('teste@example.com')
  })

  it('rejeita email inválido', () => {
    expect(emailSchema.safeParse('nope').success).toBe(false)
  })

  it('rejeita string vazia', () => {
    expect(emailSchema.safeParse('').success).toBe(false)
  })
})

describe('stringNotEmptySchema', () => {
  it('aceita string normal', () => {
    expect(stringNotEmptySchema.parse('abc')).toBe('abc')
  })

  it('aplica trim mantendo conteúdo', () => {
    expect(stringNotEmptySchema.parse('   abc   ')).toBe('abc')
  })

  it('rejeita string só de espaços', () => {
    expect(stringNotEmptySchema.safeParse('   ').success).toBe(false)
  })

  it('rejeita string vazia', () => {
    expect(stringNotEmptySchema.safeParse('').success).toBe(false)
  })
})
