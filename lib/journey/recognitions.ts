/**
 * Registro do RF14/UC15: reconhecimentos gravados em `nutriz_recognitions` na
 * mesma transação da mudança de status, com unicidade por nutriz e tipo.
 *
 * Desde 20 de setembro de 2026 os selos que a nutriz vê na área pessoal são
 * derivados do histórico da jornada (`./badges`), porque eles precisam de
 * contagem de doações e de indicação — coisas que estas linhas booleanas não
 * expressam. Estas regras continuam valendo como registro interno da jornada.
 */

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
