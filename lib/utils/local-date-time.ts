/**
 * Conversão entre `datetime-local` (horário de São Paulo) e Date UTC.
 *
 * O campo do navegador não carrega fuso. Fixar o fuso do produto aqui evita
 * que o servidor ou o banco desloquem a hora informada pela nutriz.
 */
const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidLocalDate(value: string): boolean {
  const match = LOCAL_DATE_PATTERN.exec(value)
  if (!match) return false

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  )
}

/** Converte uma data de calendário para um Date estável ao persistir em DATE. */
export function localDateToDate(value: string): Date | null {
  if (!isValidLocalDate(value)) return null
  return new Date(`${value}T12:00:00.000Z`)
}

export function formatLocalDate(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(value)
}

export function isValidLocalDateTime(value: string): boolean {
  const match = LOCAL_DATE_TIME_PATTERN.exec(value)
  if (!match) return false

  const [, year, month, day, hour, minute] = match
  // Usa UTC apenas para validar os componentes do calendário sem depender do
  // fuso da máquina que executa o código.
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ),
  )
  if (Number.isNaN(date.getTime())) return false

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day) &&
    date.getUTCHours() === Number(hour) &&
    date.getUTCMinutes() === Number(minute)
  )
}

export function localDateTimeToDate(value: string): Date | null {
  if (!isValidLocalDateTime(value)) return null
  return new Date(`${value}:00-03:00`)
}

export function formatDateTimeLocal(value: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(value)
  const result = Object.fromEntries(
    parts.map(({ type, value: partValue }) => [type, partValue]),
  )
  return `${result.year}-${result.month}-${result.day}T${result.hour}:${result.minute}`
}
