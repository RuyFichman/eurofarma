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
 * Marcos que o administrador pode selecionar no fluxo consolidado. Os demais
 * valores do enum permanecem apenas para compatibilidade com históricos já
 * gravados antes da simplificação da jornada.
 */
export const ADMIN_JOURNEY_STATUS_VALUES = [
  'REGISTERED',
  'FORM_RECEIVED',
  'EXAMS_COMPLETED',
  'KIT_SENT',
  'KIT_DELIVERED',
  'DONATION_CONFIRMED',
] as const satisfies readonly JourneyStatusValue[]

/**
 * Fluxo conservador adotado para o modelo inicial. Correções, reabertura de
 * jornada e qualquer atalho exigem uma decisão operacional explícita do
 * Lactare; por isso não são inferidos aqui.
 *
 * `DONATION_CONFIRMED` é um registro administrativo manual do Lactare. Até a
 * evidência operacional ser definida, ele não autoriza inferir impacto,
 * recorrência ou qualquer detalhe clínico. `RECURRING_DONATION_ELIGIBLE`
 * continua significando somente aptidão registrada para recorrência.
 *
 * Doar é um evento que se repete, enquanto o status é um estado só. Por isso
 * `DONATION_CONFIRMED` aceita a si mesmo e volta a ser alcançável a partir de
 * `RECURRING_DONATION_ELIGIBLE`: cada registro do Lactare acrescenta uma linha
 * ao histórico append-only, que é o que a nutriz lê como suas doações. Sem
 * isso, só a primeira doação da vida da nutriz poderia ser registrada.
 */
export const JOURNEY_STATUS_TRANSITIONS = {
  REGISTERED: ['DOCUMENT_SENT', 'FORM_RECEIVED'],
  DOCUMENT_SENT: ['FORM_RECEIVED'],
  FORM_RECEIVED: ['EXAM_SCHEDULED', 'EXAMS_COMPLETED'],
  EXAM_SCHEDULED: ['EXAMS_COMPLETED', 'AWAITING_RESULT'],
  EXAMS_COMPLETED: ['AWAITING_RESULT', 'KIT_SENT'],
  AWAITING_RESULT: ['ELIGIBLE', 'NOT_ELIGIBLE', 'KIT_SENT'],
  ELIGIBLE: ['KIT_SENT', 'KIT_DELIVERED'],
  NOT_ELIGIBLE: [],
  KIT_SENT: ['KIT_DELIVERED'],
  KIT_DELIVERED: ['DONATION_CONFIRMED', 'RECURRING_DONATION_ELIGIBLE'],
  DONATION_CONFIRMED: ['DONATION_CONFIRMED', 'RECURRING_DONATION_ELIGIBLE'],
  RECURRING_DONATION_ELIGIBLE: ['DONATION_CONFIRMED'],
} as const satisfies Record<JourneyStatusValue, readonly JourneyStatusValue[]>

const ADMIN_JOURNEY_NEXT_STATUS = {
  REGISTERED: ['FORM_RECEIVED'],
  DOCUMENT_SENT: ['FORM_RECEIVED'],
  FORM_RECEIVED: ['EXAMS_COMPLETED'],
  EXAM_SCHEDULED: ['EXAMS_COMPLETED'],
  EXAMS_COMPLETED: ['KIT_SENT'],
  AWAITING_RESULT: ['KIT_SENT'],
  ELIGIBLE: ['KIT_SENT'],
  NOT_ELIGIBLE: [],
  KIT_SENT: ['KIT_DELIVERED'],
  KIT_DELIVERED: ['DONATION_CONFIRMED'],
  DONATION_CONFIRMED: ['DONATION_CONFIRMED'],
  RECURRING_DONATION_ELIGIBLE: ['DONATION_CONFIRMED'],
} as const satisfies Record<JourneyStatusValue, readonly JourneyStatusValue[]>

export function getAllowedAdminJourneyTransitions(
  currentStatus: JourneyStatusValue,
): readonly JourneyStatusValue[] {
  return ADMIN_JOURNEY_NEXT_STATUS[currentStatus]
}

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
