import { describe, it, expect } from 'vitest'

import {
  buildDirectionsUrl,
  getAppointmentStatusKey,
} from '../../lib/utils/appointment-display'
import {
  formatLongDate,
  formatShortDate,
  formatTime,
} from '../../lib/utils/format-date'

describe('getAppointmentStatusKey', () => {
  it('separa visita futura de visita que ja passou', () => {
    expect(
      getAppointmentStatusKey({ status: 'DECLARED', isUpcoming: true }),
    ).toBe('upcoming')
    expect(
      getAppointmentStatusKey({ status: 'DECLARED', isUpcoming: false }),
    ).toBe('past')
  })

  it('cancelado e concluido ignoram a data', () => {
    expect(
      getAppointmentStatusKey({ status: 'CANCELLED', isUpcoming: true }),
    ).toBe('cancelled')
    expect(
      getAppointmentStatusKey({ status: 'CANCELLED', isUpcoming: false }),
    ).toBe('cancelled')
    expect(
      getAppointmentStatusKey({ status: 'COMPLETED', isUpcoming: false }),
    ).toBe('completed')
  })
})

describe('buildDirectionsUrl', () => {
  it('escapa o endereco na query', () => {
    const url = buildDirectionsUrl('Rua das Flores, 100, Centro, Recife - PE')
    expect(url).toContain('https://www.google.com/maps/dir/?api=1&destination=')
    expect(url).toContain('Rua%20das%20Flores')
    expect(url).not.toContain(' ')
  })
})

/**
 * O fuso e fixado em America/Sao_Paulo de proposito. Estes casos usam UTC
 * explicito para provar a conversao: 12:30 UTC e 09:30 em Sao Paulo (UTC-3).
 */
describe('formatacao de data e hora', () => {
  const date = new Date('2026-06-05T12:30:00.000Z')

  it('formata data longa com inicial maiuscula', () => {
    const formatted = formatLongDate(date)
    expect(formatted.startsWith('S')).toBe(true)
    expect(formatted).toContain('junho')
    expect(formatted).toContain('2026')
    expect(formatted).toContain('05')
  })

  it('converte o horario para o fuso de Sao Paulo', () => {
    expect(formatTime(date)).toBe('09:30')
  })

  it('mantem a data curta no mesmo fuso', () => {
    expect(formatShortDate(date)).toBe('05/06/2026')
  })

  it('nao empurra para o dia seguinte perto da meia-noite local', () => {
    // 02:00 UTC do dia 6 ainda e 23:00 do dia 5 em Sao Paulo.
    const lateNight = new Date('2026-06-06T02:00:00.000Z')
    expect(formatShortDate(lateNight)).toBe('05/06/2026')
    expect(formatTime(lateNight)).toBe('23:00')
  })
})
