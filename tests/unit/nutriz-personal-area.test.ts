import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildNutrizHistoryPdf } from '../../lib/pdf/nutriz-history'
import { extractionLogSchema } from '../../lib/validators/nutriz-personal-area'
import {
  formatDateTimeLocal,
  isValidLocalDateTime,
  localDateTimeToDate,
} from '../../lib/utils/local-date-time'

/** O conteúdo do PDF é gravado em hexadecimal dentro do content stream. */
function hex(value: string): string {
  return Buffer.from(value, 'latin1').toString('hex')
}

const PDF_COPY = {
  title: 'Histórico',
  generatedAt: 'Gerado em {date}.',
  name: 'Nutriz: {name}',
  journeyTitle: 'Jornada',
  registered: 'Cadastro em {date}',
  donorSince: 'Tempo como doadora: {duration}, desde {date}',
  donorMonths: '{count} meses',
  donorMonth: '1 mês',
  donorDays: '{count} dias',
  donorDay: '1 dia',
  status: '{label} — {date}',
  extractionTitle: 'Extrações',
  extraction: '{date} — {volume} ml',
  wellbeingTitle: 'Bem-estar',
  wellbeing: '{feeling} — {date}',
  noRecords: 'Nenhum registro.',
  privacyNote: 'Somente dados próprios.',
}

describe('registros pessoais da Minha Área', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

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
        donorSince: 'Tempo como doadora: {duration}, desde {date}',
        donorMonths: '{count} meses',
        donorMonth: '1 mês',
        donorDays: '{count} dias',
        donorDay: '1 dia',
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

  it('conta o tempo como doadora a partir da primeira doação confirmada', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-05T12:00:00.000Z'))

    const text = new TextDecoder('latin1').decode(
      buildNutrizHistoryPdf(
        {
          fullName: 'Ana da Silva',
          journey: {
            journeyStatus: 'RECURRING_DONATION_ELIGIBLE',
            createdAt: new Date('2026-08-01T12:00:00.000Z'),
            journeyHistory: [
              {
                toStatus: 'KIT_DELIVERED',
                changedAt: new Date('2026-08-20T12:00:00.000Z'),
              },
              {
                toStatus: 'DONATION_CONFIRMED',
                changedAt: new Date('2026-09-05T12:00:00.000Z'),
              },
              {
                toStatus: 'RECURRING_DONATION_ELIGIBLE',
                changedAt: new Date('2026-11-05T12:00:00.000Z'),
              },
            ],
          },
          extractionLogs: [],
          wellbeingEntries: [],
        },
        PDF_COPY,
        (status) => status,
        (date) => date.toISOString(),
      ),
    )

    expect(text).toContain(hex('Tempo como doadora: 3 meses, desde'))
  })

  it('omite o tempo como doadora sem doação confirmada', () => {
    const text = new TextDecoder('latin1').decode(
      buildNutrizHistoryPdf(
        {
          fullName: 'Ana da Silva',
          journey: {
            journeyStatus: 'KIT_DELIVERED',
            createdAt: new Date('2026-08-01T12:00:00.000Z'),
            journeyHistory: [
              {
                toStatus: 'KIT_DELIVERED',
                changedAt: new Date('2026-08-20T12:00:00.000Z'),
              },
            ],
          },
          extractionLogs: [],
          wellbeingEntries: [],
        },
        PDF_COPY,
        (status) => status,
        (date) => date.toISOString(),
      ),
    )

    expect(text).not.toContain(hex('Tempo como doadora'))
  })
})
