import { describe, expect, it } from 'vitest'

import { extractionLogSchema } from '../../lib/validators/nutriz-personal-area'
import {
  formatDateTimeLocal,
  isValidLocalDateTime,
  localDateTimeToDate,
} from '../../lib/utils/local-date-time'

describe('registros pessoais da Minha Área', () => {
  it('valida calendário e converte datetime-local no fuso de São Paulo', () => {
    expect(isValidLocalDateTime('2026-02-28T23:59')).toBe(true)
    expect(isValidLocalDateTime('2026-02-29T12:00')).toBe(false)
    expect(localDateTimeToDate('2026-02-28T23:59')?.toISOString()).toBe(
      '2026-03-01T02:59:00.000Z',
    )
    expect(formatDateTimeLocal(new Date('2026-03-01T02:59:00.000Z'))).toBe(
      '2026-02-28T23:59',
    )
  })

  it('aceita volume inteiro dentro do limite e rejeita valores fora dele', () => {
    expect(
      extractionLogSchema.safeParse({
        recordedAt: '2026-09-15T10:30',
        volumeMl: '60',
      }).success,
    ).toBe(true)
    expect(
      extractionLogSchema.safeParse({
        recordedAt: '2026-09-15T10:30',
        volumeMl: '0',
      }).success,
    ).toBe(false)
    expect(
      extractionLogSchema.safeParse({
        recordedAt: '2026-09-15T10:30',
        volumeMl: '5001',
      }).success,
    ).toBe(false)
  })
})
