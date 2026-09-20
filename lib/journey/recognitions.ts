import type { JourneyStatusValue } from './status'

export type RecognitionKindValue =
  | 'JOURNEY_STARTED'
  | 'READY_FOR_DONATION'
  | 'KIT_RECEIVED'
  | 'FIRST_DONATION'
  | 'CONTINUITY_RECOGNIZED'

export type JourneyRecognitionRule = {
  kind: RecognitionKindValue
  status: JourneyStatusValue
}

/**
 * Ordem de apresentação em "Meus selos", na área pessoal. Segue a ordem em
 * que os reconhecimentos ficam alcançáveis na jornada, não a ordem em que
 * cada nutriz efetivamente os recebe.
 */
export const RECOGNITION_KIND_ORDER: readonly RecognitionKindValue[] = [
  'JOURNEY_STARTED',
  'READY_FOR_DONATION',
  'KIT_RECEIVED',
  'FIRST_DONATION',
  'CONTINUITY_RECOGNIZED',
]

/** Reconhecimentos cumulativos, sem recompensa material ou alegação clínica. */
const RECOGNITION_BY_STATUS: Partial<
  Record<JourneyStatusValue, readonly JourneyRecognitionRule[]>
> = {
  REGISTERED: [{ kind: 'JOURNEY_STARTED', status: 'REGISTERED' }],
  ELIGIBLE: [{ kind: 'READY_FOR_DONATION', status: 'ELIGIBLE' }],
  KIT_DELIVERED: [{ kind: 'KIT_RECEIVED', status: 'KIT_DELIVERED' }],
  DONATION_CONFIRMED: [
    { kind: 'FIRST_DONATION', status: 'DONATION_CONFIRMED' },
  ],
  RECURRING_DONATION_ELIGIBLE: [
    { kind: 'CONTINUITY_RECOGNIZED', status: 'RECURRING_DONATION_ELIGIBLE' },
  ],
}

export function getRecognitionRulesForStatus(
  status: JourneyStatusValue,
): readonly JourneyRecognitionRule[] {
  return RECOGNITION_BY_STATUS[status] ?? []
}
