import { describe, expect, it } from 'vitest'
import {
  getChartMonths,
  getChartScale,
  getRegistrationOrigin,
} from '../../lib/admin/dashboard/charts'

describe('meses do dashboard', () => {
  it('atravessa o ano com seis meses consecutivos e mês atual parcial', () => {
    const now = new Date('2026-02-15T15:00:00Z')
    const months = getChartMonths(now)
    expect(months.map((m) => m.key)).toEqual([
      '2025-09',
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
    ])
    expect(months[0]?.start.toISOString()).toBe('2025-09-01T03:00:00.000Z')
    expect(months[5]?.end).toEqual(now)
    expect(months[0]?.end).toEqual(months[1]?.start)
  })
  it('não troca de mês à meia-noite UTC antes de São Paulo', () => {
    expect(getChartMonths(new Date('2026-03-01T02:59:00Z')).at(-1)?.key).toBe(
      '2026-02',
    )
    expect(getChartMonths(new Date('2026-03-01T03:00:00Z')).at(-1)?.key).toBe(
      '2026-03',
    )
  })
})
describe('origem dos cadastros', () => {
  it('não transforma preferência de contato ou UTM ausente em origem', () => {
    for (const source of [
      null,
      {},
      { contactPreference: 'WHATSAPP' },
      { utm_source: '' },
      { utm_source: 2 },
    ])
      expect(getRegistrationOrigin(source)).toBe('unknown')
  })
  it('normaliza apenas identificadores explícitos', () => {
    expect(getRegistrationOrigin({ utm_source: ' WhatsApp ' })).toBe('whatsapp')
    expect(getRegistrationOrigin({ utm_source: 'wa.me' })).toBe('whatsapp')
    expect(getRegistrationOrigin({ utm_source: 'SITE' })).toBe('web')
    expect(getRegistrationOrigin({ utm_source: 'instagram' })).toBe('other')
  })
})
describe('escala do gráfico', () => {
  it('mantém escala finita e rótulos inteiros para base vazia e pequena', () => {
    for (const max of [0, 1, 3, 142, 600, 3847]) {
      const scale = getChartScale(max)
      expect(scale.ceiling).toBeGreaterThanOrEqual(max)
      expect(scale.ceiling).toBeGreaterThan(0)
      expect(scale.ticks[0]).toBe(0)
      expect(scale.ticks.every(Number.isInteger)).toBe(true)
    }
  })
})
