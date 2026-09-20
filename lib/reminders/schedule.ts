import type { ReminderTimingOption } from '@prisma/client'

/**
 * Cálculo puro de datas para "Meus lembretes" (20/09/2026). Nada aqui grava
 * no banco nem envia mensagem — só resolve, a partir de um dado real já
 * existente (sessão de extração, data autodeclarada ou visita registrada
 * pelo admin), quando cada aviso apareceria e o texto da prévia mostrada na
 * tela de configuração. O job que realmente enfileira o envio fica para uma
 * etapa seguinte (ver seção "Meus lembretes" do AGENTS.md).
 *
 * Fuso fixo em America/Sao_Paulo (UTC-3, sem horário de verão desde 2019) —
 * mesma premissa já usada em `lib/utils/local-date-time.ts`.
 */
export const MILK_FREEZER_VALIDITY_DAYS = 15

const SAO_PAULO_UTC_OFFSET_HOURS = 3
const DAY_IN_MS = 24 * 60 * 60 * 1000

function localDateParts(date: Date): {
  year: number
  month: number
  day: number
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(date)
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  }
}

/** Meio-dia UTC do dia civil (em America/Sao_Paulo) de `date` — seguro para
 * somar/subtrair dias inteiros sem risco de virada por fuso. */
function localNoonAnchor(date: Date): Date {
  const { year, month, day } = localDateParts(date)
  return new Date(Date.UTC(year, month - 1, day, 12))
}

/** Desloca `date` em dias inteiros de calendário (America/Sao_Paulo). */
export function addLocalDays(date: Date, days: number): Date {
  return new Date(localNoonAnchor(date).getTime() + days * DAY_IN_MS)
}

/** Constrói o instante UTC correspondente a `hour:minute` local no dia de `date`. */
export function atLocalTime(date: Date, hour: number, minute = 0): Date {
  const { year, month, day } = localDateParts(date)
  return new Date(
    Date.UTC(year, month - 1, day, hour + SAO_PAULO_UTC_OFFSET_HOURS, minute),
  )
}

// --- Validade do leite -----------------------------------------------------

const MILK_TIMING_DAYS: Record<
  Extract<
    ReminderTimingOption,
    'MILK_1_DAY_BEFORE' | 'MILK_2_DAYS_BEFORE' | 'MILK_3_DAYS_BEFORE'
  >,
  number
> = {
  MILK_1_DAY_BEFORE: 1,
  MILK_2_DAYS_BEFORE: 2,
  MILK_3_DAYS_BEFORE: 3,
}

export function computeMilkValidityDeadline(recordedAt: Date): Date {
  return addLocalDays(recordedAt, MILK_FREEZER_VALIDITY_DAYS)
}

export function computeMilkValidityAlertDate(
  recordedAt: Date,
  timingOption: keyof typeof MILK_TIMING_DAYS,
): Date {
  const deadline = computeMilkValidityDeadline(recordedAt)
  return atLocalTime(addLocalDays(deadline, -MILK_TIMING_DAYS[timingOption]), 8)
}

// --- Doação futura -----------------------------------------------------

export function computeFutureDonationAlertDates(
  targetDate: Date,
  timingOption: Extract<
    ReminderTimingOption,
    | 'DONATION_7_DAYS_BEFORE'
    | 'DONATION_ON_DAY'
    | 'DONATION_7_DAYS_BEFORE_AND_ON_DAY'
  >,
): Date[] {
  const sevenDaysBefore = atLocalTime(addLocalDays(targetDate, -7), 8)
  const onDay = atLocalTime(targetDate, 8)

  switch (timingOption) {
    case 'DONATION_7_DAYS_BEFORE':
      return [sevenDaysBefore]
    case 'DONATION_ON_DAY':
      return [onDay]
    case 'DONATION_7_DAYS_BEFORE_AND_ON_DAY':
      return [sevenDaysBefore, onDay]
  }
}

// --- Entrega do kit -----------------------------------------------------

/**
 * Horários fixos de aviso, independentes do horário real da visita: manhã do
 * próprio dia (8h) e noite da véspera (18h) — não é "N horas antes".
 */
export function computeKitDeliveryAlertDateTimes(
  scheduledAt: Date,
  timingOption: Extract<
    ReminderTimingOption,
    'KIT_MORNING_OF' | 'KIT_1_DAY_BEFORE' | 'KIT_1_DAY_BEFORE_AND_ON_DAY'
  >,
): Date[] {
  const morningOf = atLocalTime(scheduledAt, 8)
  const dayBefore = atLocalTime(addLocalDays(scheduledAt, -1), 18)

  switch (timingOption) {
    case 'KIT_MORNING_OF':
      return [morningOf]
    case 'KIT_1_DAY_BEFORE':
      return [dayBefore]
    case 'KIT_1_DAY_BEFORE_AND_ON_DAY':
      return [dayBefore, morningOf]
  }
}
