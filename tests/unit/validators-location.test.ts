import { describe, it, expect } from 'vitest'

import { citySearchParamsSchema } from '../../lib/validators/location'

describe('citySearchParamsSchema', () => {
  it('aceita UF válida em maiúsculas', () => {
    const result = citySearchParamsSchema.safeParse({ state: 'SP' })
    expect(result.success).toBe(true)
    expect(result.success && result.data.state).toBe('SP')
  })

  it('normaliza minúsculas para maiúsculas', () => {
    const result = citySearchParamsSchema.safeParse({ state: 'sp' })
    expect(result.success).toBe(true)
    expect(result.success && result.data.state).toBe('SP')
  })

  it('normaliza espaços nas pontas', () => {
    const result = citySearchParamsSchema.safeParse({ state: ' sp ' })
    expect(result.success).toBe(true)
    expect(result.success && result.data.state).toBe('SP')
  })

  it('rejeita UF inexistente', () => {
    expect(citySearchParamsSchema.safeParse({ state: 'XX' }).success).toBe(
      false,
    )
  })

  it('rejeita nome de estado por extenso', () => {
    expect(
      citySearchParamsSchema.safeParse({ state: 'SaoPaulo' }).success,
    ).toBe(false)
  })

  it('rejeita dígitos', () => {
    expect(citySearchParamsSchema.safeParse({ state: '123' }).success).toBe(
      false,
    )
  })

  it('rejeita string vazia', () => {
    expect(citySearchParamsSchema.safeParse({ state: '' }).success).toBe(false)
  })
})
