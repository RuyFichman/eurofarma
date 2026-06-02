import { z } from 'zod'

import { ufSchema } from './common'

/**
 * Valida os query params de `GET /api/cities`.
 *
 * Aceita `state` com espaços nas pontas e em minúsculas (ex.: ` sp `),
 * normalizando para a sigla canônica em maiúsculas antes de validar contra a
 * lista oficial de UFs. Reaproveita `ufSchema` (fonte única das UFs, em
 * `lib/validators/common.ts`) — não duplicamos a lista aqui.
 */
export const citySearchParamsSchema = z.object({
  state: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(ufSchema),
})

export type CitySearchParams = z.infer<typeof citySearchParamsSchema>
