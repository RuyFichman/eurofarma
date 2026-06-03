import { describe, it, expect } from 'vitest'

import { buildTelHref, formatPhone } from '../../lib/utils/format-phone'

describe('formatPhone', () => {
  it('formata telefone fixo de 10 dígitos', () => {
    expect(formatPhone('1130919492')).toBe('(11) 3091-9492')
  })

  it('formata celular de 11 dígitos', () => {
    expect(formatPhone('11999998888')).toBe('(11) 99999-8888')
  })

  it('normaliza entrada já formatada', () => {
    expect(formatPhone('(11) 3091-9492')).toBe('(11) 3091-9492')
  })

  it('devolve o valor original quando o tamanho é inesperado', () => {
    expect(formatPhone('123')).toBe('123')
  })
})

describe('buildTelHref', () => {
  it('adiciona o código de país quando ausente', () => {
    expect(buildTelHref('1130919492')).toBe('tel:+551130919492')
  })

  it('preserva o código de país quando já presente', () => {
    expect(buildTelHref('551130919492')).toBe('tel:+551130919492')
  })

  it('remove formatação', () => {
    expect(buildTelHref('(11) 3091-9492')).toBe('tel:+551130919492')
  })
})
