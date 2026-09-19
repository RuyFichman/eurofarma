import { z } from 'zod'

import { stringNotEmptySchema, ufSchema } from './common'

/**
 * Edição dos próprios dados na Minha Área.
 *
 * Só nome e localidade. O WhatsApp fica fora de propósito: ele é o
 * identificador da nutriz no chatbot e é único no banco, então trocá-lo é uma
 * operação de suporte, não de autoatendimento. O consentimento LGPD também
 * não entra — ele é um fato datado, não um campo editável.
 */
export const nutrizAccountUpdateSchema = z.object({
  fullName: stringNotEmptySchema
    .min(3, 'Informe seu nome completo.')
    .max(120, 'Nome muito longo.'),
  state: z.string().trim().toUpperCase().pipe(ufSchema),
  city: stringNotEmptySchema
    .min(2, 'Informe sua cidade.')
    .max(100, 'Cidade inválida.'),
})

export type NutrizAccountUpdateInput = z.infer<typeof nutrizAccountUpdateSchema>
