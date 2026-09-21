import { z } from 'zod'

import {
  ADMIN_JOURNEY_STATUS_VALUES,
  JOURNEY_STATUS_VALUES,
} from '../journey/status'
import { isValidLocalDateTime } from '../utils/local-date-time'
import { ADMIN } from '../i18n/pt-br'

export const JOURNEY_ADMINISTRATIVE_NOTE_MAX_LENGTH = 500
const COPY = ADMIN.nutrizJourney.validation

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
  .max(JOURNEY_ADMINISTRATIVE_NOTE_MAX_LENGTH, COPY.noteMax)
  .refine((value) => !containsClinicalDetail(value), {
    message: COPY.noteClinical,
  })
  .optional()
  .transform((value) => value || undefined)

/**
 * Só tem efeito quando `toStatus` é `KIT_SENT` — data/horário combinados da
 * visita, informados pelo admin (20/09/2026). Fonte legítima do lembrete de
 * entrega do kit na área da nutriz; opcional, e a aplicação ignora o campo
 * para qualquer outra transição.
 */
export const kitDeliveryScheduledAtSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || isValidLocalDateTime(value),
    COPY.kitScheduledAtInvalid,
  )
  .optional()
  .transform((value) => value || undefined)

export const journeyStatusTransitionSchema = z.object({
  fromStatus: z.enum(JOURNEY_STATUS_VALUES),
  toStatus: z.enum(ADMIN_JOURNEY_STATUS_VALUES),
  administrativeNote: journeyAdministrativeNoteSchema,
  kitDeliveryScheduledAt: kitDeliveryScheduledAtSchema,
})

export const nutrizProfileIdSchema = z.string().uuid(COPY.idInvalid)

/**
 * Contrato completo recebido pela Server Action do painel. O identificador
 * também é revalidado no servidor: embora venha de uma página renderizada pelo
 * próprio NutriLink, um cliente pode adulterar qualquer argumento da action.
 */
export const adminJourneyStatusUpdateSchema = z
  .object({
    nutrizProfileId: nutrizProfileIdSchema,
  })
  .and(journeyStatusTransitionSchema)

export type JourneyStatusTransitionInput = z.input<
  typeof journeyStatusTransitionSchema
>

export type JourneyStatusTransition = z.output<
  typeof journeyStatusTransitionSchema
>

export type AdminJourneyStatusUpdate = z.output<
  typeof adminJourneyStatusUpdateSchema
>
