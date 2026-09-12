import { describe, expect, it } from 'vitest'

import {
  coverageCepRequestSchema,
  coverageCepSchema,
} from '../../lib/validators/coverage'

describe('coverageCepSchema', () => {
  it('aceita CEP com ou sem máscara e retorna somente dígitos', () => {
    expect(coverageCepSchema.parse('01001-000')).toBe('01001000')
    expect(coverageCepSchema.parse('01001000')).toBe('01001000')
  })

  it('rejeita letras e formatos incompletos', () => {
    expect(coverageCepSchema.safeParse('0100A-000').success).toBe(false)
    expect(coverageCepSchema.safeParse('01001-00').success).toBe(false)
  })

  it('rejeita dígitos adicionais', () => {
    expect(coverageCepSchema.safeParse('01001-0009').success).toBe(false)
  })
})

describe('coverageCepRequestSchema', () => {
  it('valida o corpo da API', () => {
    expect(coverageCepRequestSchema.parse({ cep: '05508-000' })).toEqual({
      cep: '05508000',
    })
  })
})
