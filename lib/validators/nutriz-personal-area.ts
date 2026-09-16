import { z } from 'zod'

import { NUTRIZ_AUTH } from '../i18n/pt-br'
import { isValidLocalDateTime } from '../utils/local-date-time'

const COPY = NUTRIZ_AUTH.area.personal.validation

export const extractionLogSchema = z.object({
  recordedAt: z.string().refine(isValidLocalDateTime, COPY.recordedAtInvalid),
  volumeMl: z.coerce
    .number({ invalid_type_error: COPY.volumeInvalid })
    .int(COPY.volumeInteger)
    .min(1, COPY.volumeMin)
    .max(5000, COPY.volumeMax),
})

export const wellbeingFeelingSchema = z.enum(['GOOD', 'OK', 'TIRED'])

export const wellbeingEntrySchema = z.object({
  feeling: wellbeingFeelingSchema,
})

export const personalRecordIdSchema = z.string().uuid(COPY.idInvalid)

export type ExtractionLogInput = {
  recordedAt: string
  volumeMl: string | number
}
export type ExtractionLogValues = z.output<typeof extractionLogSchema>
export type WellbeingEntryInput = z.input<typeof wellbeingEntrySchema>
export type WellbeingFeelingValue = z.infer<typeof wellbeingFeelingSchema>
