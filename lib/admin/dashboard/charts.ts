export type ChartMonth = { key: string; label: string; start: Date; end: Date }
export type MonthlyActivity = {
  key: string
  label: string
  registrations: number
  appointments: number
}
export const ORIGIN_KEYS = ['whatsapp', 'web', 'other', 'unknown'] as const
export type RegistrationOrigin = (typeof ORIGIN_KEYS)[number]
export type OriginCount = { key: RegistrationOrigin; count: number }
export type DashboardChartsData = {
  months: MonthlyActivity[]
  origins: OriginCount[]
}

/** Seis meses de calendário em São Paulo; limites UTC, mês atual parcial. */
export function getChartMonths(now: Date): ChartMonth[] {
  const local = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  return Array.from({ length: 6 }, (_, index) => {
    const start = new Date(
      Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 5 + index, 1, 3),
    )
    const next = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1, 3),
    )
    return {
      key: start.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        year: '2-digit',
        timeZone: 'America/Sao_Paulo',
      }).format(start),
      start,
      end: next > now ? now : next,
    }
  })
}

/** Preferência de contato não é atribuição. Só utm_source explícito conta. */
export function getRegistrationOrigin(source: unknown): RegistrationOrigin {
  if (!source || typeof source !== 'object' || !('utm_source' in source))
    return 'unknown'
  const value = source.utm_source
  if (typeof value !== 'string' || !value.trim()) return 'unknown'
  const normalized = value.trim().toLowerCase()
  if (['whatsapp', 'wa.me'].includes(normalized)) return 'whatsapp'
  if (['web', 'site', 'website'].includes(normalized)) return 'web'
  return 'other'
}

/** Quatro intervalos inteiros, sempre partindo de zero. */
export function getChartScale(max: number): {
  ceiling: number
  ticks: number[]
} {
  const rawStep = Math.max(1, max / 4)
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = Math.ceil(rawStep / magnitude) * magnitude
  return { ceiling: step * 4, ticks: [0, 1, 2, 3, 4].map((n) => n * step) }
}
