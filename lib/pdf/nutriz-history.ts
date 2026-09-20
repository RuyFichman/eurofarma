import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { Color, PDFFont, PDFPage } from 'pdf-lib'

import type { JourneyStatusValue } from '@/lib/journey/status'
import type { WellbeingFeelingValue } from '@/lib/validators/nutriz-personal-area'

/**
 * Layout do PDF exportado pela nutriz (RF20). Reescrito com `pdf-lib` porque
 * o formato anterior — texto corrido, sem tabela, sem cor — não comunicava a
 * diferença entre dado autodeclarado (extração, bem-estar) e dado registrado
 * pela equipe do Lactare (doação). `pdf-lib` é pura TypeScript, sem binário
 * nativo, e mede o texto de verdade (`font.widthOfTextAtSize`), o que evita
 * a quebra de linha por contagem de caractere do gerador anterior — a mesma
 * classe de bug do PDF de referência que motivou esta reescrita, onde o
 * título e o parágrafo de abertura ficam sobrepostos.
 *
 * As cores usadas aqui são os valores hexadecimais documentados nos
 * comentários de `app/globals.css` (`--primary` #3A7AB8, `--secondary`
 * #D6EAFF etc.). Um content stream de PDF não lê variável CSS — se a paleta
 * mudar, este arquivo precisa mudar junto.
 */

const PAGE_WIDTH = 595.28 // A4 em pontos
const PAGE_HEIGHT = 841.89
const MARGIN_X = 48
const MARGIN_TOP = 54
const MARGIN_BOTTOM = 54
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2

const COLOR = {
  primary: rgb(58 / 255, 122 / 255, 184 / 255), // --primary #3A7AB8
  secondary: rgb(214 / 255, 234 / 255, 255 / 255), // --secondary #D6EAFF
  navy: rgb(26 / 255, 43 / 255, 60 / 255), // --foreground / navy #1A2B3C
  muted: rgb(0.344, 0.4, 0.456), // --muted-foreground hsl(210 14% 40%)
  mutedBg: rgb(0.944, 0.96, 0.976), // --muted hsl(210 40% 96%)
  border: rgb(0.808, 0.885, 0.952), // --border hsl(208 60% 88%)
  white: rgb(1, 1, 1),
} as const satisfies Record<string, Color>

type Fonts = { regular: PDFFont; bold: PDFFont }

type TableColumn = { label: string; width: number }

/**
 * Cursor de escrita: cada função de desenho parte do topo livre da página
 * (`cursorY`), decide se cabe no espaço restante e, se não couber, abre uma
 * página nova antes de desenhar — nunca corta um bloco no meio.
 */
function createLayout(doc: PDFDocument, fonts: Fonts) {
  let page: PDFPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let cursorY = PAGE_HEIGHT - MARGIN_TOP

  function newPage() {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    cursorY = PAGE_HEIGHT - MARGIN_TOP
  }

  function ensureSpace(height: number) {
    if (cursorY - height < MARGIN_BOTTOM) newPage()
  }

  function wrapText(
    text: string,
    font: PDFFont,
    size: number,
    maxWidth: number,
  ): string[] {
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length === 0) return ['']

    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = candidate
      }
    }
    if (current) lines.push(current)
    return lines
  }

  function drawBrand(text: string) {
    page.drawText(text, {
      x: MARGIN_X,
      y: cursorY - 14,
      size: 14,
      font: fonts.bold,
      color: COLOR.primary,
    })
    cursorY -= 26
  }

  /** Título com espaçamento fixo abaixo — é o que faltava na referência. */
  function drawTitle(text: string) {
    page.drawText(text, {
      x: MARGIN_X,
      y: cursorY - 18,
      size: 19,
      font: fonts.bold,
      color: COLOR.navy,
    })
    cursorY -= 32
  }

  function drawSectionTitle(text: string) {
    ensureSpace(24)
    page.drawText(text, {
      x: MARGIN_X,
      y: cursorY - 11,
      size: 10.5,
      font: fonts.bold,
      color: COLOR.primary,
    })
    cursorY -= 22
  }

  function drawParagraph(
    text: string,
    opts: {
      size?: number
      font?: PDFFont
      color?: Color
      spaceAfter?: number
    } = {},
  ) {
    const size = opts.size ?? 9.5
    const font = opts.font ?? fonts.regular
    const color = opts.color ?? COLOR.muted
    const lineHeight = size * 1.45

    for (const textLine of wrapText(text, font, size, CONTENT_WIDTH)) {
      ensureSpace(lineHeight)
      page.drawText(textLine, {
        x: MARGIN_X,
        y: cursorY - size,
        size,
        font,
        color,
      })
      cursorY -= lineHeight
    }
    cursorY -= opts.spaceAfter ?? 4
  }

  function drawLabelValue(label: string, value: string) {
    ensureSpace(40)
    page.drawText(label, {
      x: MARGIN_X,
      y: cursorY - 9,
      size: 8,
      font: fonts.regular,
      color: COLOR.muted,
    })
    cursorY -= 17
    page.drawText(value, {
      x: MARGIN_X,
      y: cursorY - 13,
      size: 14,
      font: fonts.bold,
      color: COLOR.navy,
    })
    cursorY -= 26
  }

  /** Faixa horizontal — a moldura arredondada da referência virou retângulo
   * reto: `pdf-lib` não tem canto arredondado nativo, e reproduzi-lo com
   * `drawSvgPath` exigiria acertar a inversão de eixo Y do SVG à mão, o
   * mesmo tipo de erro geométrico que causou a sobreposição no PDF de
   * referência. Um retângulo reto é a troca segura. */
  function drawBadge(text: string, tone: 'primary' | 'neutral') {
    const height = 30
    ensureSpace(height + 16)
    const top = cursorY
    const background = tone === 'primary' ? COLOR.secondary : COLOR.mutedBg
    const foreground = tone === 'primary' ? COLOR.primary : COLOR.muted
    const size = 11

    page.drawRectangle({
      x: MARGIN_X,
      y: top - height,
      width: CONTENT_WIDTH,
      height,
      color: background,
    })
    const textWidth = fonts.bold.widthOfTextAtSize(text, size)
    page.drawText(text, {
      x: MARGIN_X + (CONTENT_WIDTH - textWidth) / 2,
      y: top - height / 2 - size / 2 + 3,
      size,
      font: fonts.bold,
      color: foreground,
    })
    cursorY = top - height - 16
  }

  function drawTable(
    columns: readonly TableColumn[],
    rows: readonly string[][],
  ) {
    const headerHeight = 22
    const headerFontSize = 9
    const bodyFontSize = 9.5
    const rowLineHeight = 13
    const cellPaddingX = 10
    const cellPaddingY = 9

    function columnX(index: number): number {
      let x = MARGIN_X
      for (let i = 0; i < index; i += 1) x += columns[i]?.width ?? 0
      return x
    }

    function drawHeader() {
      ensureSpace(headerHeight)
      const top = cursorY
      page.drawRectangle({
        x: MARGIN_X,
        y: top - headerHeight,
        width: CONTENT_WIDTH,
        height: headerHeight,
        color: COLOR.primary,
      })
      columns.forEach((column, index) => {
        page.drawText(column.label, {
          x: columnX(index) + cellPaddingX,
          y: top - headerHeight / 2 - headerFontSize / 2 + 2,
          size: headerFontSize,
          font: fonts.bold,
          color: COLOR.white,
        })
      })
      cursorY = top - headerHeight
    }

    drawHeader()

    for (const row of rows) {
      const wrappedCells = columns.map((column, index) =>
        wrapText(
          row[index] ?? '',
          fonts.regular,
          bodyFontSize,
          column.width - cellPaddingX * 2,
        ),
      )
      const lineCount = Math.max(...wrappedCells.map((cell) => cell.length), 1)
      const rowHeight = lineCount * rowLineHeight + cellPaddingY

      if (cursorY - rowHeight < MARGIN_BOTTOM) {
        newPage()
        drawHeader()
      }

      const top = cursorY
      wrappedCells.forEach((cellLines, index) => {
        cellLines.forEach((cellLine, lineIndex) => {
          page.drawText(cellLine, {
            x: columnX(index) + cellPaddingX,
            y: top - cellPaddingY / 2 - (lineIndex + 1) * rowLineHeight + 3,
            size: bodyFontSize,
            font: fonts.regular,
            color: COLOR.navy,
          })
        })
      })
      page.drawLine({
        start: { x: MARGIN_X, y: top - rowHeight },
        end: { x: MARGIN_X + CONTENT_WIDTH, y: top - rowHeight },
        thickness: 0.75,
        color: COLOR.border,
      })
      cursorY = top - rowHeight
    }

    cursorY -= 12
  }

  function drawSummaryBox(items: readonly { label: string; value: string }[]) {
    const height = 58
    ensureSpace(height + 16)
    const top = cursorY
    const columnWidth = CONTENT_WIDTH / items.length

    page.drawRectangle({
      x: MARGIN_X,
      y: top - height,
      width: CONTENT_WIDTH,
      height,
      color: COLOR.mutedBg,
      borderColor: COLOR.border,
      borderWidth: 1,
    })
    items.forEach((item, index) => {
      const x = MARGIN_X + index * columnWidth + 18
      page.drawText(item.label, {
        x,
        y: top - 22,
        size: 8.5,
        font: fonts.regular,
        color: COLOR.muted,
      })
      page.drawText(item.value, {
        x,
        y: top - 42,
        size: 13,
        font: fonts.bold,
        color: COLOR.navy,
      })
    })
    cursorY = top - height - 16
  }

  function drawNoteBox(title: string, text: string) {
    const size = 9
    const lineHeight = size * 1.5
    const lines = wrapText(text, fonts.regular, size, CONTENT_WIDTH - 32)
    const titleHeight = 20
    const height = 20 + titleHeight + lines.length * lineHeight

    ensureSpace(height)
    const top = cursorY
    page.drawRectangle({
      x: MARGIN_X,
      y: top - height,
      width: CONTENT_WIDTH,
      height,
      color: COLOR.mutedBg,
    })
    page.drawText(title, {
      x: MARGIN_X + 16,
      y: top - 24,
      size: 10,
      font: fonts.bold,
      color: COLOR.navy,
    })
    lines.forEach((textLine, index) => {
      page.drawText(textLine, {
        x: MARGIN_X + 16,
        y: top - 24 - titleHeight - index * lineHeight,
        size,
        font: fonts.regular,
        color: COLOR.muted,
      })
    })
    cursorY = top - height - 16
  }

  function drawDivider() {
    ensureSpace(16)
    page.drawLine({
      start: { x: MARGIN_X, y: cursorY },
      end: { x: MARGIN_X + CONTENT_WIDTH, y: cursorY },
      thickness: 1,
      color: COLOR.border,
    })
    cursorY -= 16
  }

  function drawFooter(text: string) {
    drawDivider()
    const size = 8.5
    const width = fonts.regular.widthOfTextAtSize(text, size)
    ensureSpace(size)
    page.drawText(text, {
      x: MARGIN_X + (CONTENT_WIDTH - width) / 2,
      y: cursorY - size,
      size,
      font: fonts.regular,
      color: COLOR.muted,
    })
    cursorY -= size + 6
  }

  return {
    drawBrand,
    drawTitle,
    drawSectionTitle,
    drawParagraph,
    drawLabelValue,
    drawBadge,
    drawTable,
    drawSummaryBox,
    drawNoteBox,
    drawDivider,
    drawFooter,
  }
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
  wellbeingEntries: Array<{
    recordedAt: Date
    feeling: WellbeingFeelingValue
  }>
}

export type NutrizHistoryPdfCopy = {
  brand: string
  title: string
  intro: string
  nameLabel: string
  badgeDonor: string
  badgeRegistered: string
  extractionSectionTitle: string
  extractionSectionDescription: string
  extractionColumnDate: string
  extractionColumnTime: string
  extractionColumnVolume: string
  extractionFootnote: string
  extractionEmpty: string
  donationSectionTitle: string
  donationSectionDescription: string
  donationColumnDate: string
  donationColumnRegisteredBy: string
  donationRegisteredByValue: string
  donationEmpty: string
  summaryTotalLabel: string
  summaryTotalOne: string
  summaryTotalMany: string
  summaryDurationLabel: string
  donorMonths: string
  donorMonth: string
  donorDays: string
  donorDay: string
  wellbeingSectionTitle: string
  wellbeingSectionDescription: string
  wellbeingColumnDate: string
  wellbeingColumnFeeling: string
  aboutTitle: string
  aboutText: string
  footer: string
}

/**
 * O tempo como doadora conta a partir da primeira doação confirmada pelo
 * Lactare. Sem essa transição registrada não existe período nenhum, e a
 * seção correspondente simplesmente não entra no documento.
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
  copy: Pick<
    NutrizHistoryPdfCopy,
    'donorMonths' | 'donorMonth' | 'donorDays' | 'donorDay'
  >,
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

/**
 * Ordena por data decrescente sem mutar a entrada — a consulta devolve tudo
 * em ordem crescente para reaproveitar em outros lugares, e o documento
 * exportado mostra o mais recente primeiro, como o resto da área pessoal.
 */
function byMostRecentFirst<
  T extends { recordedAt: Date } | { changedAt: Date },
>(items: readonly T[]): T[] {
  const at = (item: T) =>
    'recordedAt' in item ? item.recordedAt : item.changedAt
  return [...items].sort((a, b) => at(b).getTime() - at(a).getTime())
}

export async function buildNutrizHistoryPdf(
  data: NutrizHistoryPdfData,
  copy: NutrizHistoryPdfCopy,
  formatDate: (value: Date) => string,
  formatTime: (value: Date) => string,
  formatGeneratedAt: (value: Date) => string,
  getFeelingLabel: (feeling: WellbeingFeelingValue) => string,
): Promise<Uint8Array> {
  const now = new Date()
  const donorSince = firstDonationAt(data.journey.journeyHistory)
  const donations = byMostRecentFirst(
    data.journey.journeyHistory.filter(
      (entry) => entry.toStatus === 'DONATION_CONFIRMED',
    ),
  )
  const extractions = byMostRecentFirst(data.extractionLogs)
  const wellbeingEntries = byMostRecentFirst(data.wellbeingEntries)

  const doc = await PDFDocument.create()
  doc.setTitle(copy.title)
  doc.setLanguage('pt-BR')

  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  }
  const layout = createLayout(doc, fonts)

  layout.drawBrand(copy.brand)
  layout.drawTitle(copy.title)
  layout.drawParagraph(copy.intro, { spaceAfter: 14 })
  layout.drawDivider()

  layout.drawLabelValue(copy.nameLabel, data.fullName)

  if (donorSince) {
    layout.drawBadge(
      copy.badgeDonor.replace('{date}', formatDate(donorSince)),
      'primary',
    )
  } else {
    layout.drawBadge(
      copy.badgeRegistered.replace(
        '{date}',
        formatDate(data.journey.createdAt),
      ),
      'neutral',
    )
  }

  layout.drawSectionTitle(copy.extractionSectionTitle)
  layout.drawParagraph(copy.extractionSectionDescription, { spaceAfter: 10 })
  if (extractions.length > 0) {
    layout.drawTable(
      [
        { label: copy.extractionColumnDate, width: 130 },
        { label: copy.extractionColumnTime, width: 100 },
        { label: copy.extractionColumnVolume, width: CONTENT_WIDTH - 230 },
      ],
      extractions.map((entry) => [
        formatDate(entry.recordedAt),
        formatTime(entry.recordedAt),
        `${entry.volumeMl} ml`,
      ]),
    )
    layout.drawParagraph(copy.extractionFootnote, { size: 8.5, spaceAfter: 18 })
  } else {
    layout.drawParagraph(copy.extractionEmpty, { spaceAfter: 18 })
  }

  layout.drawSectionTitle(copy.donationSectionTitle)
  layout.drawParagraph(copy.donationSectionDescription, { spaceAfter: 10 })
  if (donations.length > 0) {
    layout.drawTable(
      [
        { label: copy.donationColumnDate, width: CONTENT_WIDTH * 0.4 },
        { label: copy.donationColumnRegisteredBy, width: CONTENT_WIDTH * 0.6 },
      ],
      donations.map((entry) => [
        formatDate(entry.changedAt),
        copy.donationRegisteredByValue,
      ]),
    )
    layout.drawSummaryBox([
      {
        label: copy.summaryTotalLabel,
        value:
          donations.length === 1
            ? copy.summaryTotalOne
            : copy.summaryTotalMany.replace(
                '{count}',
                String(donations.length),
              ),
      },
      {
        label: copy.summaryDurationLabel,
        // donorSince nunca é nulo aqui: veio do mesmo filtro de `donations`.
        value: donorDuration(donorSince as Date, now, copy),
      },
    ])
  } else {
    layout.drawParagraph(copy.donationEmpty, { spaceAfter: 18 })
  }

  if (wellbeingEntries.length > 0) {
    layout.drawSectionTitle(copy.wellbeingSectionTitle)
    layout.drawParagraph(copy.wellbeingSectionDescription, { spaceAfter: 10 })
    layout.drawTable(
      [
        { label: copy.wellbeingColumnDate, width: CONTENT_WIDTH * 0.35 },
        { label: copy.wellbeingColumnFeeling, width: CONTENT_WIDTH * 0.65 },
      ],
      wellbeingEntries.map((entry) => [
        formatDate(entry.recordedAt),
        getFeelingLabel(entry.feeling),
      ]),
    )
  }

  layout.drawNoteBox(copy.aboutTitle, copy.aboutText)
  layout.drawFooter(copy.footer.replace('{date}', formatGeneratedAt(now)))

  // Sem streams de referência cruzada em objeto (recurso do PDF 1.5): mantém
  // o arquivo compatível com leitores de PDF mais antigos, sem ganho de
  // tamanho relevante num documento de poucas páginas.
  return doc.save({ useObjectStreams: false })
}
