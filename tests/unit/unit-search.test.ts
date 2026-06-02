import { describe, it, expect } from 'vitest'

import { parseUnitSearchParams } from '../../lib/validators/unit-search'

function parse(query: string) {
  return parseUnitSearchParams(new URLSearchParams(query))
}

describe('parseUnitSearchParams', () => {
  it('aceita state válido e aplica defaults de paginação', () => {
    const result = parse('state=SP')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.state).toBe('SP')
    expect(result.data.page).toBe(1)
    expect(result.data.limit).toBe(10)
    expect(result.data.city).toBeNull()
    expect(result.data.neighborhood).toBeNull()
    expect(result.data.type).toBeNull()
    expect(result.data.hasWhatsapp).toBeNull()
  })

  it('normaliza state minúsculo para maiúsculo', () => {
    const result = parse('state=sp')
    expect(result.ok && result.data.state).toBe('SP')
  })

  it('falta de state retorna MISSING_STATE', () => {
    const result = parse('city=São Paulo')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('MISSING_STATE')
  })

  it('state inválido retorna INVALID_STATE', () => {
    const result = parse('state=XX')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('INVALID_STATE')
  })

  it('type inválido retorna INVALID_TYPE', () => {
    const result = parse('state=SP&type=invalid')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('INVALID_TYPE')
  })

  it('type válido é mantido em snake_case', () => {
    const result = parse('state=SP&type=milk_bank')
    expect(result.ok && result.data.type).toBe('milk_bank')
  })

  it('has_whatsapp aceita true/1 e false/0', () => {
    expect(parse('state=SP&has_whatsapp=true').ok).toBe(true)
    const t1 = parse('state=SP&has_whatsapp=1')
    expect(t1.ok && t1.data.hasWhatsapp).toBe(true)
    const f0 = parse('state=SP&has_whatsapp=0')
    expect(f0.ok && f0.data.hasWhatsapp).toBe(false)
  })

  it('has_whatsapp inválido retorna INVALID_HAS_WHATSAPP', () => {
    const result = parse('state=SP&has_whatsapp=sim')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('INVALID_HAS_WHATSAPP')
  })

  it('page=0 retorna INVALID_PAGE', () => {
    const result = parse('state=SP&page=0')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('INVALID_PAGE')
  })

  it('page não inteiro retorna INVALID_PAGE', () => {
    const result = parse('state=SP&page=1.5')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('INVALID_PAGE')
  })

  it('limit=100 retorna INVALID_LIMIT', () => {
    const result = parse('state=SP&limit=100')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('INVALID_LIMIT')
  })

  it('limit dentro do range é aceito', () => {
    const result = parse('state=SP&limit=5')
    expect(result.ok && result.data.limit).toBe(5)
  })
})
