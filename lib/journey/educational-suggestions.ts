import type { JourneyStatusValue } from './status'

/**
 * Sugestões educativas disponíveis na área pessoal. Os identificadores não
 * são textos de interface: eles apontam para conteúdos públicos versionados e
 * acessíveis sem depender de uma avaliação clínica ou de conteúdo dinâmico.
 */
export const EDUCATIONAL_SUGGESTION_IDS = [
  'DONATION_PATH',
  'FAQ',
  'PRACTICAL_GUIDES',
] as const

export type EducationalSuggestionId =
  (typeof EDUCATIONAL_SUGGESTION_IDS)[number]

const EDUCATIONAL_SUGGESTIONS_BY_STATUS = {
  REGISTERED: ['DONATION_PATH', 'FAQ'],
  DOCUMENT_SENT: ['DONATION_PATH', 'FAQ'],
  FORM_RECEIVED: ['DONATION_PATH', 'FAQ'],
  EXAM_SCHEDULED: ['DONATION_PATH', 'FAQ'],
  EXAMS_COMPLETED: ['DONATION_PATH', 'FAQ'],
  AWAITING_RESULT: ['DONATION_PATH', 'FAQ'],
  ELIGIBLE: ['DONATION_PATH', 'PRACTICAL_GUIDES'],
  NOT_ELIGIBLE: ['FAQ', 'DONATION_PATH'],
  KIT_SENT: ['DONATION_PATH', 'PRACTICAL_GUIDES'],
  KIT_DELIVERED: ['PRACTICAL_GUIDES', 'DONATION_PATH'],
  DONATION_CONFIRMED: ['PRACTICAL_GUIDES', 'DONATION_PATH'],
  RECURRING_DONATION_ELIGIBLE: ['PRACTICAL_GUIDES', 'DONATION_PATH'],
} as const satisfies Record<
  JourneyStatusValue,
  readonly EducationalSuggestionId[]
>

/**
 * Retorna conteúdos apropriados à etapa categórica já registrada pelo
 * Lactare. Não interpreta exames, não toma decisão de aptidão e não contém
 * dados pessoais da nutriz.
 */
export function getEducationalSuggestionIds(
  status: JourneyStatusValue,
): readonly EducationalSuggestionId[] {
  return EDUCATIONAL_SUGGESTIONS_BY_STATUS[status]
}
