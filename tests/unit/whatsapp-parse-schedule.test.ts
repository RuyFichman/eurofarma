import { describe, it, expect } from 'vitest'

import { parseScheduleInput } from '../../lib/whatsapp/parse-schedule'
import { formatShortDate, formatTime } from '../../lib/utils/format-date'

/** 10/03/2026, meio-dia UTC (09:00 em Sao Paulo). */
const NOW = new Date('2026-03-10T12:00:00.000Z')

describe('parseScheduleInput', () => {
  it('entende o formato pedido pelo bot', () => {
    const parsed = parseScheduleInput('05/06 09:30', NOW)
    expect(parsed).not.toBeNull()
    expect(formatShortDate(parsed!)).toBe('05/06/2026')
    expect(formatTime(parsed!)).toBe('09:30')
  })

  it('trata o horario como local brasileiro', () => {
    // 09:30 em Sao Paulo e 12:30 UTC.
    expect(parseScheduleInput('05/06 09:30', NOW)?.toISOString()).toBe(
      '2026-06-05T12:30:00.000Z',
    )
  })

  it('aceita variacoes que a pessoa realmente digita', () => {
    for (const input of [
      '5/6 9:30',
      '05/06 às 09:30',
      '05/06 as 09:30',
      '05-06 09h30',
      'dia 05/06 09:30 por favor',
    ]) {
      const parsed = parseScheduleInput(input, NOW)
      expect(parsed, input).not.toBeNull()
      expect(formatShortDate(parsed!), input).toBe('05/06/2026')
    }
  })

  it('aceita ano explicito', () => {
    expect(formatShortDate(parseScheduleInput('05/06/2027 09:30', NOW)!)).toBe(
      '05/06/2027',
    )
  })

  /**
   * Sem ano, a data que ja passou neste ano vira a do ano seguinte — marcar no
   * passado criaria um agendamento que a tela ja mostraria vencido.
   */
  it('joga para o ano seguinte quando a data ja passou', () => {
    expect(formatShortDate(parseScheduleInput('01/02 09:30', NOW)!)).toBe(
      '01/02/2027',
    )
  })

  it('acha o proximo 29 de fevereiro valido', () => {
    expect(formatShortDate(parseScheduleInput('29/02 09:30', NOW)!)).toBe(
      '29/02/2028',
    )
  })

  it('recusa data que nao existe', () => {
    expect(parseScheduleInput('31/02/2026 09:30', NOW)).toBeNull()
    expect(parseScheduleInput('32/01/2026 09:30', NOW)).toBeNull()
    expect(parseScheduleInput('05/13 09:30', NOW)).toBeNull()
  })

  it('recusa horario impossivel', () => {
    expect(parseScheduleInput('05/06 25:00', NOW)).toBeNull()
    expect(parseScheduleInput('05/06 09:75', NOW)).toBeNull()
  })

  /** O bot repete a instrucao em vez de adivinhar linguagem natural. */
  it('recusa linguagem natural', () => {
    for (const input of [
      'quinta que vem de manha',
      'amanha as 9',
      'nao sei ainda',
      '',
      '05/06',
    ]) {
      expect(parseScheduleInput(input, NOW), input).toBeNull()
    }
  })
})
