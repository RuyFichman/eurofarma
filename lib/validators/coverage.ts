import { z } from 'zod'

import { COVERAGE } from '../i18n/pt-br'

const CEP_PATTERN = /^\d{5}-?\d{3}$/

export const coverageCepSchema = z
  .string()
  .trim()
  .regex(CEP_PATTERN, COVERAGE.checker.cep.validation)
  .transform((value) => value.replace(/\D/g, ''))

export const coverageCepRequestSchema = z.object({
  cep: coverageCepSchema,
})

export type CoverageCepRequest = z.output<typeof coverageCepRequestSchema>
