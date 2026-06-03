import { describe, it, expect } from 'vitest'

import { buildWhatsappUrl } from '../../lib/utils/whatsapp'

describe('buildWhatsappUrl', () => {
  it('mantém o código de país quando já presente (13 dígitos)', () => {
    expect(buildWhatsappUrl('5511999998888')).toBe(
      'https://wa.me/5511999998888',
    )
  })

  it('adiciona o código de país 55 quando ausente (11 dígitos)', () => {
    expect(buildWhatsappUrl('11999998888')).toBe('https://wa.me/5511999998888')
  })

  it('aceita telefone fixo de 10 dígitos', () => {
    expect(buildWhatsappUrl('1130919492')).toBe('https://wa.me/551130919492')
  })

  it('remove formatação antes de montar o link', () => {
    expect(buildWhatsappUrl('(11) 99999-8888')).toBe(
      'https://wa.me/5511999998888',
    )
  })

  it('codifica a mensagem opcional em ?text=', () => {
    const url = buildWhatsappUrl('11999998888', 'Olá, quero doar!')
    expect(url).toBe(
      'https://wa.me/5511999998888?text=Ol%C3%A1%2C%20quero%20doar!',
    )
  })

  it('ignora mensagem vazia ou só com espaços', () => {
    expect(buildWhatsappUrl('11999998888', '   ')).toBe(
      'https://wa.me/5511999998888',
    )
  })

  it('retorna null quando não há dígitos suficientes', () => {
    expect(buildWhatsappUrl('123')).toBeNull()
    expect(buildWhatsappUrl('')).toBeNull()
  })
})
