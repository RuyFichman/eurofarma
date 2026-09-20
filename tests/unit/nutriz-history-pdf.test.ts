import zlib from 'node:zlib'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildNutrizHistoryPdf } from '../../lib/pdf/nutriz-history'

/**
 * `pdf-lib` comprime o content stream de cada página com Flate. Para
 * inspecionar o texto gerado sem depender de um leitor de PDF completo,
 * extraímos cada bloco `stream…endstream`, descomprimimos com o `zlib` do
 * próprio Node (sem dependência nova) e decodificamos as strings hex `<..>
 * Tj` de volta para texto. Isso funciona porque, para o intervalo de
 * caracteres acentuados do pt-BR, WinAnsiEncoding e Latin-1 coincidem — a
 * exceção é a faixa 0x80–0x9F (travessão incluso), então os testes evitam
 * asserções que atravessem um travessão.
 */
function extractPdfText(pdfBytes: Uint8Array): string {
  const buffer = Buffer.from(pdfBytes)
  const start = Buffer.from('stream\n')
  const end = Buffer.from('\nendstream')
  let index = 0
  let raw = ''

  while (true) {
    const streamStart = buffer.indexOf(start, index)
    if (streamStart === -1) break
    const contentStart = streamStart + start.length
    const streamEnd = buffer.indexOf(end, contentStart)
    if (streamEnd === -1) break

    const chunk = buffer.subarray(contentStart, streamEnd)
    try {
      raw += zlib.inflateSync(chunk).toString('latin1')
    } catch {
      raw += chunk.toString('latin1')
    }
    index = streamEnd + end.length
  }

  return raw.replace(/<([0-9A-Fa-f]+)>/g, (_, hex: string) =>
    Buffer.from(hex, 'hex').toString('latin1'),
  )
}

const PDF_COPY = {
  brand: 'NutriLink',
  title: 'Resumo da jornada da nutriz',
  intro: 'Documento gerado a partir dos dados registrados na Minha área.',
  nameLabel: 'NOME DA NUTRIZ',
  badgeDonor: 'Doadora desde {date}',
  badgeRegistered: 'Jornada iniciada em {date}',
  extractionSectionTitle: 'SESSÕES DE EXTRAÇÃO REGISTRADAS',
  extractionSectionDescription: 'Dados informados pela própria nutriz.',
  extractionColumnDate: 'Data',
  extractionColumnTime: 'Hora',
  extractionColumnVolume: 'Volume',
  extractionFootnote: 'Este registro não aciona nem confirma coleta.',
  extractionEmpty: 'Nenhum registro de extração.',
  donationSectionTitle: 'HISTÓRICO DE DOAÇÕES CONFIRMADAS',
  donationSectionDescription: 'Cada item vem de uma doação registrada.',
  donationColumnDate: 'Data da doação',
  donationColumnRegisteredBy: 'Registrado por',
  donationRegisteredByValue: 'Equipe do Lactare',
  donationEmpty: 'Ainda não há doação registrada pela Lactare.',
  summaryTotalLabel: 'TOTAL DE DOAÇÕES',
  summaryTotalOne: '1 doação confirmada',
  summaryTotalMany: '{count} doações confirmadas',
  summaryDurationLabel: 'TEMPO COMO DOADORA',
  donorMonths: '{count} meses',
  donorMonth: '1 mês',
  donorDays: '{count} dias',
  donorDay: '1 dia',
  wellbeingSectionTitle: 'REGISTROS DE BEM-ESTAR',
  wellbeingSectionDescription: 'Sensação informada pela própria nutriz.',
  wellbeingColumnDate: 'Data',
  wellbeingColumnFeeling: 'Como se sentiu',
  aboutTitle: 'Sobre este documento',
  aboutText: 'Reflete apenas o que foi registrado no NutriLink.',
  footer: 'Documento gerado em {date}',
}

const formatDate = (value: Date) => value.toISOString().slice(0, 10)
const formatTime = (value: Date) => value.toISOString().slice(11, 16)
const formatGeneratedAt = (value: Date) => value.toISOString()
const getFeelingLabel = (feeling: 'GOOD' | 'OK' | 'TIRED') =>
  ({ GOOD: 'Bem', OK: 'Tudo bem', TIRED: 'Cansada' })[feeling]

function build(
  overrides: Partial<Parameters<typeof buildNutrizHistoryPdf>[0]> = {},
) {
  return buildNutrizHistoryPdf(
    {
      fullName: 'Ana da Silva',
      journey: {
        journeyStatus: 'REGISTERED',
        createdAt: new Date('2026-09-01T12:00:00.000Z'),
        journeyHistory: [],
      },
      extractionLogs: [],
      wellbeingEntries: [],
      ...overrides,
    },
    PDF_COPY,
    formatDate,
    formatTime,
    formatGeneratedAt,
    getFeelingLabel,
  )
}

describe('PDF do resumo da jornada (RF20)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('gera um arquivo PDF válido', async () => {
    const pdf = await build()
    const bytes = Buffer.from(pdf)
    expect(bytes.toString('latin1', 0, 8)).toBe('%PDF-1.7')
    expect(bytes.toString('latin1').trimEnd().endsWith('%%EOF')).toBe(true)
  })

  it('nunca inclui campos administrativos ou internos', async () => {
    const text = extractPdfText(await build())
    expect(text).not.toContain('administrativeNote')
    expect(text).not.toContain('changedByUser')
  })

  it('mostra "jornada iniciada" sem doação confirmada, nunca "doadora"', async () => {
    const text = extractPdfText(await build())
    expect(text).toContain('Jornada iniciada em 2026-09-01')
    expect(text).not.toContain('Doadora desde')
    expect(text).toContain('Ainda não há doação registrada pela Lactare.')
  })

  it('mostra o selo de doadora e o total no plural a partir da 2ª doação', async () => {
    const text = extractPdfText(
      await build({
        journey: {
          journeyStatus: 'DONATION_CONFIRMED',
          createdAt: new Date('2026-08-01T12:00:00.000Z'),
          journeyHistory: [
            {
              toStatus: 'DONATION_CONFIRMED',
              changedAt: new Date('2026-08-20T12:00:00.000Z'),
            },
            {
              toStatus: 'DONATION_CONFIRMED',
              changedAt: new Date('2026-09-10T12:00:00.000Z'),
            },
          ],
        },
      }),
    )

    expect(text).toContain('Doadora desde 2026-08-20')
    expect(text).toContain('2 doações confirmadas')
    // A data mais antiga também aparece no selo "Doadora desde", antes da
    // tabela — por isso comparamos com a última ocorrência dela (a linha da
    // tabela), não com a primeira, para checar a ordem: mais recente primeiro.
    expect(text.indexOf('2026-09-10')).toBeLessThan(
      text.lastIndexOf('2026-08-20'),
    )
    expect(text).toContain('Equipe do Lactare')
  })

  it('usa o singular com exatamente uma doação confirmada', async () => {
    const text = extractPdfText(
      await build({
        journey: {
          journeyStatus: 'DONATION_CONFIRMED',
          createdAt: new Date('2026-08-01T12:00:00.000Z'),
          journeyHistory: [
            {
              toStatus: 'DONATION_CONFIRMED',
              changedAt: new Date('2026-08-20T12:00:00.000Z'),
            },
          ],
        },
      }),
    )

    expect(text).toContain('1 doação confirmada')
    expect(text).not.toContain('doações confirmadas')
  })

  it('conta o tempo como doadora a partir da primeira doação confirmada', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-05T12:00:00.000Z'))

    const text = extractPdfText(
      await build({
        journey: {
          journeyStatus: 'RECURRING_DONATION_ELIGIBLE',
          createdAt: new Date('2026-08-01T12:00:00.000Z'),
          journeyHistory: [
            {
              toStatus: 'DONATION_CONFIRMED',
              changedAt: new Date('2026-09-05T12:00:00.000Z'),
            },
          ],
        },
      }),
    )

    expect(text).toContain('3 meses')
  })

  it('não conta RECURRING_DONATION_ELIGIBLE como doação', async () => {
    const text = extractPdfText(
      await build({
        journey: {
          journeyStatus: 'RECURRING_DONATION_ELIGIBLE',
          createdAt: new Date('2026-08-01T12:00:00.000Z'),
          journeyHistory: [
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
      }),
    )

    expect(text).toContain('1 doação confirmada')
  })

  it('lista sessões de extração com data, hora e volume', async () => {
    const text = extractPdfText(
      await build({
        extractionLogs: [
          { recordedAt: new Date('2026-09-05T13:36:00.000Z'), volumeMl: 200 },
        ],
      }),
    )

    expect(text).toContain('2026-09-05')
    expect(text).toContain('13:36')
    expect(text).toContain('200 ml')
  })

  it('mostra a seção de extração vazia sem inventar registro', async () => {
    const text = extractPdfText(await build())
    expect(text).toContain('Nenhum registro de extração.')
  })

  it('traduz a sensação de bem-estar para o rótulo em português', async () => {
    const text = extractPdfText(
      await build({
        wellbeingEntries: [
          {
            recordedAt: new Date('2026-09-06T10:00:00.000Z'),
            feeling: 'TIRED',
          },
        ],
      }),
    )

    expect(text).toContain('Cansada')
    expect(text).not.toContain('TIRED')
  })

  it('omite a seção de bem-estar quando não há registro', async () => {
    const text = extractPdfText(await build())
    expect(text).not.toContain('REGISTROS DE BEM-ESTAR')
  })

  it('pagina sem cortar linhas de tabela quando há muitos registros', async () => {
    const extractionLogs = Array.from({ length: 60 }, (_, index) => ({
      recordedAt: new Date(Date.UTC(2026, 0, index + 1, 10, 0)),
      volumeMl: 50 + index,
    }))

    const pdf = await build({ extractionLogs })
    const pageCount = (
      Buffer.from(pdf)
        .toString('latin1')
        .match(/\/Type\s*\/Page[^s]/g) ?? []
    ).length
    expect(pageCount).toBeGreaterThan(1)

    const text = extractPdfText(pdf)
    expect(text).toContain('50 ml')
    expect(text).toContain('109 ml')
  })
})
