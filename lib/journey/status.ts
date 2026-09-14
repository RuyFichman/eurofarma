/**
 * Vocabulário próprio do status categórico da jornada (RF16).
 *
 * Mantido Prisma-free para que as regras possam ser usadas no servidor, em
 * validadores e em testes sem carregar o client do banco. Os nomes espelham o
 * enum `JourneyStatus` do Prisma; textos visíveis continuam no i18n.
 */
export const JOURNEY_STATUS_VALUES = [
  'REGISTERED',
  'FORM_RECEIVED',
  'EXAM_SCHEDULED',
  'AWAITING_RESULT',
  'ELIGIBLE',
  'NOT_ELIGIBLE',
  'KIT_DELIVERED',
  'RECURRING_DONATION_ELIGIBLE',
] as const

export type JourneyStatusValue = (typeof JOURNEY_STATUS_VALUES)[number]

/**
 * Fluxo conservador adotado para o modelo inicial. Correções, reabertura de
 * jornada e qualquer atalho exigem uma decisão operacional explícita do
 * Lactare; por isso não são inferidos aqui.
 *
 * `RECURRING_DONATION_ELIGIBLE` significa aptidão registrada pelo Lactare, não
 * confirmação de uma ou mais doações. Essa confirmação continua fora do RF16.
 */
export const JOURNEY_STATUS_TRANSITIONS = {
  REGISTERED: ['FORM_RECEIVED'],
  FORM_RECEIVED: ['EXAM_SCHEDULED'],
  EXAM_SCHEDULED: ['AWAITING_RESULT'],
  AWAITING_RESULT: ['ELIGIBLE', 'NOT_ELIGIBLE'],
  ELIGIBLE: ['KIT_DELIVERED'],
  NOT_ELIGIBLE: [],
  KIT_DELIVERED: ['RECURRING_DONATION_ELIGIBLE'],
  RECURRING_DONATION_ELIGIBLE: [],
} as const satisfies Record<JourneyStatusValue, readonly JourneyStatusValue[]>

export function getAllowedJourneyTransitions(
  currentStatus: JourneyStatusValue,
): readonly JourneyStatusValue[] {
  return JOURNEY_STATUS_TRANSITIONS[currentStatus]
}

export function canTransitionJourneyStatus(
  fromStatus: JourneyStatusValue,
  toStatus: JourneyStatusValue,
): boolean {
  return getAllowedJourneyTransitions(fromStatus).some(
    (allowedStatus) => allowedStatus === toStatus,
  )
}
