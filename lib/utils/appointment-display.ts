/**
 * Traduz o estado bruto do agendamento no estado que a tela mostra. Função
 * pura e **Prisma-free**: recebe o status já em string literal.
 *
 * A distinção que o banco não guarda é `DECLARED` no futuro versus `DECLARED`
 * no passado — a data combinada simplesmente chegou, sem ninguém tocar no
 * registro. Sem separá-los, a tela continuaria dizendo "está marcado para" uma
 * visita de semanas atrás.
 */
export type AppointmentStatusKey =
  | 'upcoming'
  | 'past'
  | 'cancelled'
  | 'completed'

export function getAppointmentStatusKey(params: {
  status: 'DECLARED' | 'NOT_SCHEDULED' | 'CANCELLED' | 'COMPLETED'
  isUpcoming: boolean
}): AppointmentStatusKey {
  if (params.status === 'CANCELLED') return 'cancelled'
  if (params.status === 'COMPLETED') return 'completed'
  return params.isUpcoming ? 'upcoming' : 'past'
}

/**
 * Link de rota para o endereço, aberto no app de mapas do aparelho. Usa a busca
 * por texto do Google Maps em vez de coordenadas porque endereço textual é o
 * que toda unidade tem — `lat`/`lng` estão vazios na maior parte da base da
 * rBLH, e um link com coordenada nula levaria a nutriz ao meio do oceano.
 */
export function buildDirectionsUrl(fullAddress: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
}
