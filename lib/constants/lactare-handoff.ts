export const LACTARE_HANDOFF = {
  responsible: 'equipe do Lactare',
  channel: 'WHATSAPP_SAME_CHAT',
  timeZone: 'America/Sao_Paulo',
  openingHour: 9,
  closingHour: 18,
} as const

/** Atendimento humano de segunda a sábado, no horário de Brasília. */
export function isLactareHandoffOpen(now: Date): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: LACTARE_HANDOFF.timeZone,
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const weekday = parts.find((part) => part.type === 'weekday')?.value
  const hour = Number(parts.find((part) => part.type === 'hour')?.value)

  return (
    weekday !== 'Sun' &&
    Number.isInteger(hour) &&
    hour >= LACTARE_HANDOFF.openingHour &&
    hour < LACTARE_HANDOFF.closingHour
  )
}
