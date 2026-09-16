import { describe, expect, it } from 'vitest'

import { buildNutrizHistoryPdf } from '../../lib/pdf/nutriz-history'
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

  it('gera um PDF somente com o recorte pessoal informado', () => {
    const pdf = buildNutrizHistoryPdf(
      {
        fullName: 'Ana da Silva',
        journey: {
          journeyStatus: 'DONATION_CONFIRMED',
          createdAt: new Date('2026-09-01T12:00:00.000Z'),
          journeyHistory: [
            {
              toStatus: 'DONATION_CONFIRMED',
              changedAt: new Date('2026-09-05T12:00:00.000Z'),
            },
          ],
        },
        extractionLogs: [
          { recordedAt: new Date('2026-09-05T13:00:00.000Z'), volumeMl: 60 },
        ],
        wellbeingEntries: [],
      },
      {
        title: 'Histórico',
        generatedAt: 'Gerado em {date}.',
        name: 'Nutriz: {name}',
        journeyTitle: 'Jornada',
        registered: 'Cadastro em {date}',
        status: '{label} — {date}',
        extractionTitle: 'Extrações',
        extraction: '{date} — {volume} ml',
        wellbeingTitle: 'Bem-estar',
        wellbeing: '{feeling} — {date}',
        noRecords: 'Nenhum registro.',
        privacyNote: 'Somente dados próprios.',
      },
      (status) => status,
      (date) => date.toISOString(),
    )

    const text = new TextDecoder('latin1').decode(pdf)
    expect(text.startsWith('%PDF-1.4')).toBe(true)
    expect(text).toContain('%%EOF')
    expect(text).not.toContain('administrativeNote')
    expect(text).not.toContain('changedByUser')
  })
})
