import { describe, it, expect } from 'vitest'

import { buildPhoneHref, normalizePhoneDigits } from '../../lib/utils/phone'

describe('normalizePhoneDigits', () => {
  it('remove formatação e mantém os dígitos', () => {
    expect(normalizePhoneDigits('(11) 3091-9492')).toBe('1130919492')
  })

  it('retorna null para vazio/nulo/undefined', () => {
    expect(normalizePhoneDigits('')).toBeNull()
    expect(normalizePhoneDigits(null)).toBeNull()
    expect(normalizePhoneDigits(undefined)).toBeNull()
  })

  it('retorna null quando há poucos dígitos', () => {
    expect(normalizePhoneDigits('123')).toBeNull()
  })
})

describe('buildPhoneHref', () => {
  it('mantém dígitos locais sem DDI', () => {
    expect(buildPhoneHref('(11) 3091-9492')).toBe('tel:1130919492')
  })

  it('usa +DDI quando o número já carrega 55 (≥ 12 dígitos)', () => {
    expect(buildPhoneHref('5511999998888')).toBe('tel:+5511999998888')
  })

  it('retorna null para entrada inválida', () => {
    expect(buildPhoneHref('12')).toBeNull()
    expect(buildPhoneHref(null)).toBeNull()
  })
})
