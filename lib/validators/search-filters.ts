import { z } from 'zod'

import { isBrazilianState } from '../constants/brazilian-states'
import { isPublicUnitType } from '../constants/unit-types'

/**
 * Schema do formulário de busca pública (`SearchFilters`). Valida valores
 * **públicos** (snake_case para `type`), sem dependência do enum Prisma —
 * seguro em Client Components.
 *
 * `state` é normalizado (trim + uppercase) e validado contra as UFs; `city`,
 * `neighborhood` e `type` são opcionais (string vazia é aceita); `type`, quando
 * presente, precisa ser um tipo público válido; `hasWhatsapp` default `false`.
 */
export const searchFiltersSchema = z.object({
  state: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => isBrazilianState(value), {
      message: 'Selecione um estado válido.',
    }),
  city: z.string().trim(),
  neighborhood: z.string().trim(),
  type: z
    .string()
    .trim()
    .refine((value) => value === '' || isPublicUnitType(value), {
      message: 'Selecione um tipo de unidade válido.',
    }),
  hasWhatsapp: z.boolean().default(false),
})

/** Forma de entrada (campos do React Hook Form). */
export type SearchFiltersInput = z.input<typeof searchFiltersSchema>

/** Forma de saída (valores já normalizados após o resolver). */
export type SearchFiltersValues = z.output<typeof searchFiltersSchema>
