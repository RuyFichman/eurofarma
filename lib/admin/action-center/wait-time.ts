import { LACTARE_HANDOFF } from '../../constants/lactare-handoff'

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS

/**
 * America/Sao_Paulo está fixo em UTC-3 desde o fim do horário de verão em
 * 2019 — o mesmo pressuposto de `lib/utils/local-date-time.ts` e
 * `lib/reminders/schedule.ts`. Um deslocamento fixo mantém o cálculo puro,
 * determinístico e barato.
 */
const SAO_PAULO_OFFSET_MS = -3 * 60 * MINUTE_MS

/** Domingo em `Date#getUTCDay`, aplicado ao instante já deslocado para SP. */
const SUNDAY = 0

/** Minutos corridos entre `since` e `now`; nunca negativo. */
export function calendarWaitMinutes(since: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - since.getTime()) / MINUTE_MS))
}

export type BusinessWindow = {
  openingHour: number
  closingHour: number
}

/**
 * Minutos de espera dentro da janela de atendimento humano do Lactare
 * (segunda a sábado, `openingHour`–`closingHour`, horário de Brasília).
 *
 * Um pedido feito no domingo à noite começa a contar só na segunda às 9h; um
 * feito às 17h30 de sábado acumula 30 minutos e retoma na segunda. Assim a
 * criticidade não sobe durante o período em que ninguém está de plantão.
 */
export function businessWaitMinutes(
  since: Date,
  now: Date,
  window: BusinessWindow = LACTARE_HANDOFF,
): number {
  const start = since.getTime() + SAO_PAULO_OFFSET_MS
  const end = now.getTime() + SAO_PAULO_OFFSET_MS
  if (end <= start) return 0

  let totalMs = 0
  for (
    let dayStart = Math.floor(start / DAY_MS) * DAY_MS;
    dayStart < end;
    dayStart += DAY_MS
  ) {
    if (new Date(dayStart).getUTCDay() === SUNDAY) continue

    const open = dayStart + window.openingHour * 60 * MINUTE_MS
    const close = dayStart + window.closingHour * 60 * MINUTE_MS
    const overlap = Math.min(close, end) - Math.max(open, start)
    if (overlap > 0) totalMs += overlap
  }

  return Math.floor(totalMs / MINUTE_MS)
}

/** Mediana simples; `null` para lista vazia. */
export function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[middle] ?? null
  const lower = sorted[middle - 1]
  const upper = sorted[middle]
  if (lower === undefined || upper === undefined) return null
  return Math.round((lower + upper) / 2)
}

export type WaitDuration = {
  unit: 'minutes' | 'hours' | 'days'
  value: number
}

/**
 * Unidade legível para a espera: minutos até uma hora, horas até dois dias e
 * dias a partir daí. Sempre arredonda para baixo — "3 dias" nunca significa
 * menos de três dias.
 */
export function splitWaitDuration(minutes: number): WaitDuration {
  const safe = Math.max(0, Math.floor(minutes))
  if (safe < 60) return { unit: 'minutes', value: safe }
  if (safe < 48 * 60) return { unit: 'hours', value: Math.floor(safe / 60) }
  return { unit: 'days', value: Math.floor(safe / (24 * 60)) }
}
