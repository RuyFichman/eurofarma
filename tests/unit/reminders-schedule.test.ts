import { describe, expect, it } from 'vitest'

import {
  addLocalDays,
  atLocalTime,
  computeFutureDonationAlertDates,
  computeKitDeliveryAlertDateTimes,
  computeMilkValidityAlertDate,
  computeMilkValidityDeadline,
  MILK_FREEZER_VALIDITY_DAYS,
} from '../../lib/reminders/schedule'

describe('lib/reminders/schedule', () => {
  describe('addLocalDays / atLocalTime', () => {
    it('soma dias de calendário sem deslocar o fuso', () => {
      const start = new Date('2026-09-19T20:36:00.000Z') // 17:36 em São Paulo
      expect(addLocalDays(start, 15).toISOString()).toBe(
        '2026-10-04T12:00:00.000Z',
      )
    })

    it('atravessa a virada do mês corretamente', () => {
      const start = new Date('2026-09-20T12:00:00.000Z')
      expect(addLocalDays(start, 15).toISOString()).toBe(
        '2026-10-05T12:00:00.000Z',
      )
    })

    it('resolve 8h e 18h de São Paulo para o instante UTC certo (UTC-3)', () => {
      const day = new Date('2026-09-25T12:00:00.000Z')
      expect(atLocalTime(day, 8).toISOString()).toBe('2026-09-25T11:00:00.000Z')
      expect(atLocalTime(day, 18).toISOString()).toBe(
        '2026-09-25T21:00:00.000Z',
      )
    })
  })

  describe('validade do leite', () => {
    const recordedAt = new Date('2026-09-19T20:36:00.000Z')

    it('usa 15 dias como prazo do freezer', () => {
      expect(MILK_FREEZER_VALIDITY_DAYS).toBe(15)
    })

    it('calcula o prazo (04/10/2026 no exemplo do mockup)', () => {
      const deadline = computeMilkValidityDeadline(recordedAt)
      expect(deadline.toISOString()).toBe('2026-10-04T12:00:00.000Z')
    })

    it.each([
      ['MILK_1_DAY_BEFORE', '2026-10-03T11:00:00.000Z'],
      ['MILK_2_DAYS_BEFORE', '2026-10-02T11:00:00.000Z'],
      ['MILK_3_DAYS_BEFORE', '2026-10-01T11:00:00.000Z'],
    ] as const)('%s avisa às 8h de São Paulo em %s', (option, expected) => {
      expect(
        computeMilkValidityAlertDate(recordedAt, option).toISOString(),
      ).toBe(expected)
    })
  })

  describe('doação futura', () => {
    const targetDate = new Date('2026-11-15T12:00:00.000Z')

    it('7 dias antes gera um único aviso', () => {
      const dates = computeFutureDonationAlertDates(
        targetDate,
        'DONATION_7_DAYS_BEFORE',
      )
      expect(dates).toHaveLength(1)
      expect(dates[0]!.toISOString()).toBe('2026-11-08T11:00:00.000Z')
    })

    it('no próprio dia gera um único aviso na data indicada', () => {
      const dates = computeFutureDonationAlertDates(
        targetDate,
        'DONATION_ON_DAY',
      )
      expect(dates).toHaveLength(1)
      expect(dates[0]!.toISOString()).toBe('2026-11-15T11:00:00.000Z')
    })

    it('7 dias antes e no dia gera dois avisos', () => {
      const dates = computeFutureDonationAlertDates(
        targetDate,
        'DONATION_7_DAYS_BEFORE_AND_ON_DAY',
      )
      expect(dates.map((d) => d.toISOString())).toEqual([
        '2026-11-08T11:00:00.000Z',
        '2026-11-15T11:00:00.000Z',
      ])
    })
  })

  describe('entrega do kit', () => {
    const scheduledAt = new Date('2026-09-25T19:00:00.000Z') // 16h em São Paulo

    it('manhã do próprio dia avisa às 8h, independente do horário da visita', () => {
      const dates = computeKitDeliveryAlertDateTimes(
        scheduledAt,
        'KIT_MORNING_OF',
      )
      expect(dates).toHaveLength(1)
      expect(dates[0]!.toISOString()).toBe('2026-09-25T11:00:00.000Z')
    })

    it('1 dia antes avisa às 18h da véspera, não 24h antes do horário real', () => {
      const dates = computeKitDeliveryAlertDateTimes(
        scheduledAt,
        'KIT_1_DAY_BEFORE',
      )
      expect(dates).toHaveLength(1)
      expect(dates[0]!.toISOString()).toBe('2026-09-24T21:00:00.000Z')
    })

    it('1 dia antes e no dia gera os dois avisos, véspera primeiro', () => {
      const dates = computeKitDeliveryAlertDateTimes(
        scheduledAt,
        'KIT_1_DAY_BEFORE_AND_ON_DAY',
      )
      expect(dates.map((d) => d.toISOString())).toEqual([
        '2026-09-24T21:00:00.000Z',
        '2026-09-25T11:00:00.000Z',
      ])
    })
  })
})
