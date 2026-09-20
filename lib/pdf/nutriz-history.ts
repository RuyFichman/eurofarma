import type { JourneyStatusValue } from '@/lib/journey/status'

type PdfLine = { text: string; size: 10 | 12 | 16 }

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN_X = 48
const TOP_Y = 794
const LINE_HEIGHT = 17
const LINES_PER_PAGE = 43

/** Codificação WinAnsi para os caracteres usados no conteúdo pt-BR. */
const WIN_ANSI: Record<string, number> = {
  á: 0xe1,
  à: 0xe0,
  â: 0xe2,
  ã: 0xe3,
  é: 0xe9,
  ê: 0xea,
  í: 0xed,
  ó: 0xf3,
  ô: 0xf4,
  õ: 0xf5,
  ú: 0xfa,
  ç: 0xe7,
  Á: 0xc1,
  À: 0xc0,
  Â: 0xc2,
  Ã: 0xc3,
  É: 0xc9,
  Ê: 0xca,
  Í: 0xcd,
  Ó: 0xd3,
  Ô: 0xd4,
  Õ: 0xd5,
  Ú: 0xda,
  Ç: 0xc7,
  '—': 0x97,
  '–': 0x96,
  '·': 0xb7,
}

function toWinAnsiHex(value: string): string {
  return Array.from(value)
    .map((character) => {
      const code = character.charCodeAt(0)
      const encoded = code <= 0x7f ? code : (WIN_ANSI[character] ?? 0x3f)
      return encoded.toString(16).padStart(2, '0')
    })
    .join('')
}

function line(text: string, size: PdfLine['size'] = 10): PdfLine {
  return { text, size }
}

function wrapLine(value: PdfLine): PdfLine[] {
  const maxCharacters = value.size === 16 ? 48 : value.size === 12 ? 64 : 78
  if (value.text.length <= maxCharacters) return [value]

  const wrapped: PdfLine[] = []
  let current = ''
  for (const word of value.text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxCharacters && current) {
      wrapped.push(line(current, value.size))
      current = word
    } else {
      current = candidate
    }
  }
  if (current) wrapped.push(line(current, value.size))
  return wrapped
}

function contentStream(lines: PdfLine[]): string {
  return lines
    .map(
      ({ text, size }, index) =>
        `BT /F1 ${size} Tf 1 0 0 1 ${MARGIN_X} ${TOP_Y - index * LINE_HEIGHT} Tm <${toWinAnsiHex(text)}> Tj ET`,
    )
    .join('\n')
}

function makePdf(pages: PdfLine[][]): Uint8Array {
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ]
  const pageObjectNumbers: number[] = []

  for (const page of pages) {
    const pageObjectNumber = objects.length + 1
    const contentObjectNumber = pageObjectNumber + 1
    pageObjectNumbers.push(pageObjectNumber)
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
    )
    const stream = contentStream(page)
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  }

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pageObjectNumbers.length} >>`

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  return Uint8Array.from(Buffer.from(pdf, 'binary'))
}

export type NutrizHistoryPdfData = {
  fullName: string
  journey: {
    journeyStatus: JourneyStatusValue
    createdAt: Date
    journeyHistory: Array<{
      toStatus: JourneyStatusValue
      changedAt: Date
    }>
  }
  extractionLogs: Array<{ recordedAt: Date; volumeMl: number }>
  wellbeingEntries: Array<{ recordedAt: Date; feeling: string }>
}

/**
 * O tempo como doadora conta a partir da primeira doação confirmada pelo
 * Lactare. Sem essa transição registrada não existe período nenhum, e a linha
 * simplesmente não entra no documento.
 */
function firstDonationAt(
  history: NutrizHistoryPdfData['journey']['journeyHistory'],
): Date | null {
  const first = history.find((entry) => entry.toStatus === 'DONATION_CONFIRMED')
  return first ? first.changedAt : null
}

function donorDuration(
  since: Date,
  now: Date,
  copy: {
    donorMonths: string
    donorMonth: string
    donorDays: string
    donorDay: string
  },
): string {
  const months =
    (now.getFullYear() - since.getFullYear()) * 12 +
    (now.getMonth() - since.getMonth()) -
    (now.getDate() < since.getDate() ? 1 : 0)

  if (months >= 1) {
    return months === 1
      ? copy.donorMonth
      : copy.donorMonths.replace('{count}', String(months))
  }

  const days = Math.max(
    0,
    Math.floor((now.getTime() - since.getTime()) / 86_400_000),
  )
  return days === 1
    ? copy.donorDay
    : copy.donorDays.replace('{count}', String(days))
}

export function buildNutrizHistoryPdf(
  data: NutrizHistoryPdfData,
  copy: {
    title: string
    generatedAt: string
    name: string
    journeyTitle: string
    registered: string
    donorSince: string
    donorMonths: string
    donorMonth: string
    donorDays: string
    donorDay: string
    status: string
    extractionTitle: string
    extraction: string
    wellbeingTitle: string
    wellbeing: string
    noRecords: string
    privacyNote: string
  },
  getStatusLabel: (status: JourneyStatusValue) => string,
  formatDateTime: (value: Date) => string,
): Uint8Array {
  const now = new Date()
  const donorSince = firstDonationAt(data.journey.journeyHistory)

  const lines: PdfLine[] = [
    line(copy.title, 16),
    line(copy.generatedAt.replace('{date}', formatDateTime(now))),
    line(copy.name.replace('{name}', data.fullName), 12),
    line(''),
    line(copy.journeyTitle, 12),
    line(
      copy.registered.replace('{date}', formatDateTime(data.journey.createdAt)),
    ),
    ...(donorSince
      ? [
          line(
            copy.donorSince
              .replace('{duration}', donorDuration(donorSince, now, copy))
              .replace('{date}', formatDateTime(donorSince)),
          ),
        ]
      : []),
    ...data.journey.journeyHistory.map((entry) =>
      line(
        copy.status
          .replace('{label}', getStatusLabel(entry.toStatus))
          .replace('{date}', formatDateTime(entry.changedAt)),
      ),
    ),
    line(''),
    line(copy.extractionTitle, 12),
    ...(data.extractionLogs.length > 0
      ? data.extractionLogs.map((entry) =>
          line(
            copy.extraction
              .replace('{date}', formatDateTime(entry.recordedAt))
              .replace('{volume}', String(entry.volumeMl)),
          ),
        )
      : [line(copy.noRecords)]),
    line(''),
    line(copy.wellbeingTitle, 12),
    ...(data.wellbeingEntries.length > 0
      ? data.wellbeingEntries.map((entry) =>
          line(
            copy.wellbeing
              .replace('{feeling}', entry.feeling)
              .replace('{date}', formatDateTime(entry.recordedAt)),
          ),
        )
      : [line(copy.noRecords)]),
    line(''),
    line(copy.privacyNote),
  ]

  const wrappedLines = lines.flatMap(wrapLine)
  const pages: PdfLine[][] = []
  for (let index = 0; index < wrappedLines.length; index += LINES_PER_PAGE) {
    pages.push(wrappedLines.slice(index, index + LINES_PER_PAGE))
  }
  return makePdf(pages)
}
