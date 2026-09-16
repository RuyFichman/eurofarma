/**
 * Vocabulário próprio do status categórico da jornada (RF16).
 *
 * Mantido Prisma-free para que as regras possam ser usadas no servidor, em
 * validadores e em testes sem carregar o client do banco. Os nomes espelham o
 * enum `JourneyStatus` do Prisma; textos visíveis continuam no i18n.
 */
export const JOURNEY_STATUS_VALUES = [
  'REGISTERED',
  'DOCUMENT_SENT',
  'FORM_RECEIVED',
  'EXAM_SCHEDULED',
  'EXAMS_COMPLETED',
  'AWAITING_RESULT',
  'ELIGIBLE',
  'NOT_ELIGIBLE',
  'KIT_SENT',
  'KIT_DELIVERED',
  'DONATION_CONFIRMED',
  'RECURRING_DONATION_ELIGIBLE',
] as const

export type JourneyStatusValue = (typeof JOURNEY_STATUS_VALUES)[number]

/**
 * Fluxo conservador adotado para o modelo inicial. Correções, reabertura de
 * jornada e qualquer atalho exigem uma decisão operacional explícita do
 * Lactare; por isso não são inferidos aqui.
 *
 * `DONATION_CONFIRMED` é um registro administrativo manual do Lactare. Até a
 * evidência operacional ser definida, ele não autoriza inferir impacto,
 * recorrência ou qualquer detalhe clínico. `RECURRING_DONATION_ELIGIBLE`
 * continua significando somente aptidão registrada para recorrência.
 */
export const JOURNEY_STATUS_TRANSITIONS = {
  REGISTERED: ['DOCUMENT_SENT', 'FORM_RECEIVED'],
  DOCUMENT_SENT: ['FORM_RECEIVED'],
  FORM_RECEIVED: ['EXAM_SCHEDULED'],
  EXAM_SCHEDULED: ['EXAMS_COMPLETED', 'AWAITING_RESULT'],
  EXAMS_COMPLETED: ['AWAITING_RESULT'],
  AWAITING_RESULT: ['ELIGIBLE', 'NOT_ELIGIBLE'],
  ELIGIBLE: ['KIT_SENT', 'KIT_DELIVERED'],
  NOT_ELIGIBLE: [],
  KIT_SENT: ['KIT_DELIVERED'],
  KIT_DELIVERED: ['DONATION_CONFIRMED', 'RECURRING_DONATION_ELIGIBLE'],
  DONATION_CONFIRMED: ['RECURRING_DONATION_ELIGIBLE'],
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
