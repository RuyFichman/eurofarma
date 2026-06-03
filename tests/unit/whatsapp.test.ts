import { describe, it, expect } from 'vitest'

import {
  buildWhatsappUrl,
  normalizeBrazilianWhatsappNumber,
} from '../../lib/utils/whatsapp'

describe('normalizeBrazilianWhatsappNumber', () => {
  it('retorna null para vazio/nulo/undefined', () => {
    expect(normalizeBrazilianWhatsappNumber('')).toBeNull()
    expect(normalizeBrazilianWhatsappNumber(null)).toBeNull()
    expect(normalizeBrazilianWhatsappNumber(undefined)).toBeNull()
  })

  it('prefixa 55 em celular de 11 dígitos', () => {
    expect(normalizeBrazilianWhatsappNumber('11999998888')).toBe(
      '5511999998888',
    )
  })

  it('prefixa 55 em fixo de 10 dígitos', () => {
    expect(normalizeBrazilianWhatsappNumber('1130919492')).toBe('551130919492')
  })

  it('preserva número que já começa com 55 e tem ≥ 12 dígitos', () => {
    expect(normalizeBrazilianWhatsappNumber('5511999998888')).toBe(
      '5511999998888',
    )
  })

  it('remove formatação antes de normalizar', () => {
    expect(normalizeBrazilianWhatsappNumber('(11) 99999-8888')).toBe(
      '5511999998888',
    )
  })

  it('retorna null quando há menos de 10 dígitos', () => {
    expect(normalizeBrazilianWhatsappNumber('123')).toBeNull()
  })
})

describe('buildWhatsappUrl', () => {
  it('monta a URL wa.me com a mensagem codificada', () => {
    expect(
      buildWhatsappUrl({ phone: '11999998888', message: 'Olá, quero doar!' }),
    ).toBe('https://wa.me/5511999998888?text=Ol%C3%A1%2C%20quero%20doar!')
  })

  it('retorna null quando o número é inválido', () => {
    expect(buildWhatsappUrl({ phone: '123', message: 'oi' })).toBeNull()
    expect(buildWhatsappUrl({ phone: null, message: 'oi' })).toBeNull()
  })

  it('inclui ?text= mesmo com mensagem vazia', () => {
    expect(buildWhatsappUrl({ phone: '11999998888', message: '' })).toBe(
      'https://wa.me/5511999998888?text=',
    )
  })
})
