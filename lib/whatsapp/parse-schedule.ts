/**
 * Interpreta a data e a hora que a nutriz digita no chatbot.
 *
 * O bot pede **formato fixo** (`DD/MM HH:MM`) e este parser é deliberadamente
 * literal: nada de "quinta que vem" ou "amanhã de manhã". Interpretar linguagem
 * natural erra, e data errada na tela dela é pior que pergunta repetida — ela
 * apareceria no banco de leite no dia errado. Quando não reconhece, devolve
 * `null` e o bot repete a instrução.
 *
 * O fuso é **fixo em America/Sao_Paulo (UTC-3)**, o mesmo de `format-date.ts`.
 * O Brasil não tem horário de verão desde 2019, então o deslocamento é
 * constante e não precisamos de biblioteca de fuso. Sem isso, o horário
 * dependeria do fuso do servidor e voltaria trocado na tela.
 */

const BRAZIL_UTC_OFFSET_HOURS = 3

/** `05/06 09:30`, `5/6 9:30`, `05/06/2026 09:30`, com "às" e "h" opcionais. */
const SCHEDULE_PATTERN =
  /(\d{1,2})\s*[/.-]\s*(\d{1,2})(?:\s*[/.-]\s*(\d{2,4}))?(?:\s*(?:às|as|@))?\s+(\d{1,2})\s*(?::|h)\s*(\d{2})/i

function isRealDate(year: number, month: number, day: number): boolean {
  const probe = new Date(Date.UTC(year, month - 1, day))
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  )
}

/**
 * Converte data/hora locais brasileiras no `Date` (UTC) correspondente.
 * `09:30` em São Paulo é `12:30Z`.
 */
function fromBrazilLocal(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour + BRAZIL_UTC_OFFSET_HOURS, minute),
  )
}

export function parseScheduleInput(
  input: string,
  now: Date = new Date(),
): Date | null {
  const match = SCHEDULE_PATTERN.exec(input)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const rawYear = match[3]
  const hour = Number(match[4])
  const minute = Number(match[5])

  if (month < 1 || month > 12) return null
  if (hour > 23 || minute > 59) return null

  if (rawYear !== undefined) {
    const parsed = Number(rawYear)
    const year = parsed < 100 ? 2000 + parsed : parsed
    if (!isRealDate(year, month, day)) return null
    return fromBrazilLocal(year, month, day, hour, minute)
  }

  /**
   * Sem ano, assume-se o próximo em que a data existe e ainda não passou. Quem
   * responde "05/06" em dezembro está falando de junho do ano seguinte, e
   * marcar no passado criaria um agendamento que a tela já mostraria vencido.
   * O 29/02 é o motivo de o laço tentar mais de dois anos.
   */
  const currentYear = new Date(
    now.getTime() - BRAZIL_UTC_OFFSET_HOURS * 3600_000,
  ).getUTCFullYear()

  for (let year = currentYear; year <= currentYear + 8; year += 1) {
    if (!isRealDate(year, month, day)) continue
    const candidate = fromBrazilLocal(year, month, day, hour, minute)
    if (candidate >= now) return candidate
  }

  return null
}
