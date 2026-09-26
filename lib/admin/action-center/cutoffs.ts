import type { ActionCenterQueueKey } from './queues'
import {
  classifySeverity,
  maxSeverity,
  type ActionCenterSeverity,
} from './severity'
import { ACTION_CENTER_RULES, ACTION_CENTER_THRESHOLDS } from './thresholds'

const MINUTE_MS = 60_000

function minutesBefore(now: Date, minutes: number): Date {
  return new Date(now.getTime() - minutes * MINUTE_MS)
}

/**
 * Instantes de corte usados pelas consultas. Calculados aqui, a partir dos
 * limites tipados, para que nenhum número mágico viva dentro do SQL.
 */
export type ActionCenterCutoffs = {
  noProgress: Date
  kitNotDelivered: Date
  kitVisitOverdue: Date
  firstDonation: Date
  returningDonors: Date
  deliveryFailureLookback: Date
  inboundStuckProcessing: Date
}

export function getActionCenterCutoffs(now: Date): ActionCenterCutoffs {
  return {
    noProgress: minutesBefore(
      now,
      ACTION_CENTER_THRESHOLDS.noProgress.entryMinutes,
    ),
    kitNotDelivered: minutesBefore(
      now,
      ACTION_CENTER_THRESHOLDS.kitNotDelivered.entryMinutes,
    ),
    kitVisitOverdue: minutesBefore(
      now,
      ACTION_CENTER_RULES.kitVisitOverdueMinutes,
    ),
    firstDonation: minutesBefore(
      now,
      ACTION_CENTER_THRESHOLDS.firstDonation.entryMinutes,
    ),
    returningDonors: minutesBefore(
      now,
      ACTION_CENTER_THRESHOLDS.returningDonors.entryMinutes,
    ),
    deliveryFailureLookback: minutesBefore(
      now,
      ACTION_CENTER_RULES.deliveryFailureLookbackMinutes,
    ),
    inboundStuckProcessing: minutesBefore(
      now,
      ACTION_CENTER_RULES.inboundStuckProcessingMinutes,
    ),
  }
}

/** A visita informada pelo admin já passou há mais que a tolerância. */
export function isKitVisitOverdue(
  scheduledAt: Date | null,
  now: Date,
): boolean {
  return (
    scheduledAt !== null &&
    scheduledAt.getTime() <=
      getActionCenterCutoffs(now).kitVisitOverdue.getTime()
  )
}

/**
 * Criticidade de um item individual do detalhamento. `waitMinutes` já vem no
 * relógio da fila; a visita de kit vencida eleva para, no mínimo, média.
 */
export function getItemSeverity(
  key: ActionCenterQueueKey,
  waitMinutes: number,
  options: { kitVisitOverdue?: boolean } = {},
): ActionCenterSeverity {
  const severity = classifySeverity(waitMinutes, ACTION_CENTER_THRESHOLDS[key])
  return key === 'kitNotDelivered' && options.kitVisitOverdue
    ? maxSeverity(severity, 'medium')
    : severity
}
