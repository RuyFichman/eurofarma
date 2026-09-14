import { z } from 'zod'

import {
  canTransitionJourneyStatus,
  JOURNEY_STATUS_VALUES,
} from '../journey/status'

export const JOURNEY_ADMINISTRATIVE_NOTE_MAX_LENGTH = 500

// Barreira de redução de dados, não classificador clínico. A lista cobre os
// marcadores mais comuns de laudo, diagnóstico, exame específico e tratamento;
// autorização e revisão humana continuam obrigatórias no fluxo administrativo.
const CLINICAL_DETAIL_PATTERNS = [
  /\b(?:diagn[oó]stic[oa]|laudo|sintoma|medicamento|tratamento)\b/iu,
  /\b(?:hiv|htlv|hepatite|s[ií]filis|sorologia|hemograma)\b/iu,
  /\b(?:positivo|negativo|reagente|n[aã]o\s+reagente)\b/iu,
] as const

function containsClinicalDetail(value: string): boolean {
  return CLINICAL_DETAIL_PATTERNS.some((pattern) => pattern.test(value))
}

export const journeyAdministrativeNoteSchema = z
  .string()
  .trim()
  .max(JOURNEY_ADMINISTRATIVE_NOTE_MAX_LENGTH)
  .refine((value) => !containsClinicalDetail(value), {
    message:
      'Registre apenas contexto administrativo, sem laudo, diagnóstico, exame específico ou motivo clínico.',
  })
  .optional()
  .transform((value) => value || undefined)

export const journeyStatusTransitionSchema = z
  .object({
    fromStatus: z.enum(JOURNEY_STATUS_VALUES),
    toStatus: z.enum(JOURNEY_STATUS_VALUES),
    administrativeNote: journeyAdministrativeNoteSchema,
  })
  .refine(
    ({ fromStatus, toStatus }) =>
      canTransitionJourneyStatus(fromStatus, toStatus),
    {
      path: ['toStatus'],
      message: 'Transição de status da jornada não permitida.',
    },
  )

export type JourneyStatusTransitionInput = z.input<
  typeof journeyStatusTransitionSchema
>

export type JourneyStatusTransition = z.output<
  typeof journeyStatusTransitionSchema
>
