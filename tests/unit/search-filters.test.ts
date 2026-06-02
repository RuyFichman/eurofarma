import { describe, it, expect } from 'vitest'

import { searchFiltersSchema } from '../../lib/validators/search-filters'

describe('searchFiltersSchema', () => {
  it('normaliza UF minúscula para maiúscula', () => {
    const result = searchFiltersSchema.safeParse({
      state: 'sp',
      city: '',
      neighborhood: '',
      type: '',
    })
    expect(result.success).toBe(true)
    expect(result.success && result.data.state).toBe('SP')
  })

  it('aplica hasWhatsapp default false quando ausente', () => {
    const result = searchFiltersSchema.safeParse({
      state: 'SP',
      city: '',
      neighborhood: '',
      type: '',
    })
    expect(result.success && result.data.hasWhatsapp).toBe(false)
  })

  it('aceita campos opcionais vazios', () => {
    const result = searchFiltersSchema.safeParse({
      state: 'RJ',
      city: '',
      neighborhood: '',
      type: '',
    })
    expect(result.success).toBe(true)
  })

  it('aceita um tipo público válido', () => {
    const result = searchFiltersSchema.safeParse({
      state: 'SP',
      city: 'São Paulo',
      neighborhood: '',
      type: 'milk_bank',
    })
    expect(result.success && result.data.type).toBe('milk_bank')
  })

  it('rejeita tipo inválido', () => {
    const result = searchFiltersSchema.safeParse({
      state: 'SP',
      city: '',
      neighborhood: '',
      type: 'invalid_type',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita UF inválida', () => {
    const result = searchFiltersSchema.safeParse({
      state: 'XX',
      city: '',
      neighborhood: '',
      type: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita estado vazio (obrigatório)', () => {
    const result = searchFiltersSchema.safeParse({
      state: '',
      city: '',
      neighborhood: '',
      type: '',
    })
    expect(result.success).toBe(false)
  })
})
