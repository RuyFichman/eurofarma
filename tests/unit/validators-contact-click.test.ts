import { describe, expect, it } from 'vitest'

import { contactClickSchema } from '../../lib/validators/contact-click'

/** Payload exatamente como `LactareContactActions` monta e envia via beacon. */
function clientPayload(overrides: Record<string, unknown> = {}) {
  return {
    event: 'lactare_contact_clicked',
    channel: 'whatsapp',
    surface: 'coverage_result',
    source_utm: { utm_source: 'instagram', utm_medium: 'social' },
    ...overrides,
  }
}

describe('contactClickSchema', () => {
  it('aceita o payload real enviado pelo cliente', () => {
    expect(contactClickSchema.safeParse(clientPayload()).success).toBe(true)
  })

  it('aceita o telefone como canal', () => {
    const result = contactClickSchema.safeParse(
      clientPayload({ channel: 'phone' }),
    )

    expect(result.success).toBe(true)
  })

  it('recusa canal fora da lista de canais oficiais', () => {
    expect(
      contactClickSchema.safeParse(clientPayload({ channel: 'email' })).success,
    ).toBe(false)
  })

  it('recusa superfície desconhecida', () => {
    expect(
      contactClickSchema.safeParse(clientPayload({ surface: 'home' })).success,
    ).toBe(false)
  })

  it('recusa evento genérico', () => {
    expect(
      contactClickSchema.safeParse(clientPayload({ event: 'clicked' })).success,
    ).toBe(false)
  })

  it('funciona sem UTM na URL', () => {
    const result = contactClickSchema.safeParse(
      clientPayload({ source_utm: {} }),
    )

    expect(result.success).toBe(true)
  })

  /**
   * A regra do RF07: o evento não tem onde guardar CEP, unidade ou qualquer
   * identificador, então o que o cliente mandar a mais é descartado antes de
   * chegar ao banco.
   */
  it('descarta campos que o modelo anônimo não comporta', () => {
    const result = contactClickSchema.parse(
      clientPayload({
        cep: '01001-000',
        unit_id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
        referrer: 'https://exemplo.com/?email=maria@example.com',
        path: '/verificar-cobertura',
        nutriz_id: 'abc',
      }),
    )

    expect(result).not.toHaveProperty('cep')
    expect(result).not.toHaveProperty('unit_id')
    expect(result).not.toHaveProperty('referrer')
    expect(result).not.toHaveProperty('path')
    expect(result).not.toHaveProperty('nutriz_id')
    expect(Object.keys(result).sort()).toEqual([
      'channel',
      'event',
      'source_utm',
      'surface',
    ])
  })
})
