import { describe, it, expect } from 'vitest'

import { whatsappClickTrackSchema } from '../../lib/validators/track'

const VALID_UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

/** Payload exatamente como `UnitCardActions` monta e envia via `sendBeacon`. */
function clientPayload(overrides: Record<string, unknown> = {}) {
  return {
    event: 'whatsapp_clicked',
    unit_id: VALID_UUID,
    unit_slug: 'banco-de-leite-exemplo',
    source: 'unit_card',
    path: '/buscar?state=SP',
    source_utm: {
      utm_source: 'instagram',
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    },
    referrer: 'https://exemplo.com/',
    ...overrides,
  }
}

describe('whatsappClickTrackSchema', () => {
  it('aceita o payload real enviado pelo cliente', () => {
    const result = whatsappClickTrackSchema.safeParse(clientPayload())

    expect(result.success).toBe(true)
  })

  it('descarta campos sem coluna no schema (unit_slug, source, path)', () => {
    const result = whatsappClickTrackSchema.parse(clientPayload())

    expect(result).not.toHaveProperty('unit_slug')
    expect(result).not.toHaveProperty('source')
    expect(result).not.toHaveProperty('path')
  })

  it('rejeita evento fora da lista fechada', () => {
    const result = whatsappClickTrackSchema.safeParse(
      clientPayload({ event: 'unit_view' }),
    )

    expect(result.success).toBe(false)
  })

  it('rejeita unit_id que não é uuid', () => {
    const result = whatsappClickTrackSchema.safeParse(
      clientPayload({ unit_id: 'nao-e-uuid' }),
    )

    expect(result.success).toBe(false)
  })

  it('normaliza referrer ausente, nulo ou vazio para null', () => {
    const missing = whatsappClickTrackSchema.parse(
      clientPayload({ referrer: undefined }),
    )
    const nulled = whatsappClickTrackSchema.parse(
      clientPayload({ referrer: null }),
    )
    const blank = whatsappClickTrackSchema.parse(
      clientPayload({ referrer: '   ' }),
    )

    expect(missing.referrer).toBeNull()
    expect(nulled.referrer).toBeNull()
    expect(blank.referrer).toBeNull()
  })

  it('rejeita referrer acima do limite defensivo de 500 caracteres', () => {
    const result = whatsappClickTrackSchema.safeParse(
      clientPayload({ referrer: `https://exemplo.com/${'a'.repeat(500)}` }),
    )

    expect(result.success).toBe(false)
  })

  it('mantém source_utm cru para o sanitizador tratar depois', () => {
    const result = whatsappClickTrackSchema.parse(
      clientPayload({ source_utm: { utm_source: 'ads', lixo: 'x' } }),
    )

    expect(result.source_utm).toEqual({ utm_source: 'ads', lixo: 'x' })
  })
})
