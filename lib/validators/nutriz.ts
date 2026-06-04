import { z } from 'zod'
import { InterestStatus, ContactPreference } from '@prisma/client'
import {
  stringNotEmptySchema,
  whatsappSchema,
  ufSchema,
  emailSchema,
} from './common'

/**
 * Formulario publico de cadastro da nutriz (Sprint 4).
 * Coleta minima sob LGPD: apenas 5 campos.
 */
export const nutrizSignupSchema = z.object({
  fullName: stringNotEmptySchema.min(3, 'Nome muito curto.').max(120),
  phoneWhatsapp: whatsappSchema,
  state: ufSchema,
  city: stringNotEmptySchema.min(2, 'Cidade invalida.').max(100),
  lgpdConsent: z.literal(true, {
    message: 'E necessario aceitar a politica de privacidade.',
  }),
})

/**
 * Payload do endpoint público `POST /api/nutriz` (Sprint 4.3).
 *
 * Reusa os building blocks de `common.ts`: `phoneWhatsapp` é normalizado para
 * dígitos com DDI 55, `state` é normalizado para UF maiúscula e validado.
 * `sourceUtm` entra como `unknown` e é tratado por `sanitizeSourceUtm` no handler.
 *
 * Observação de escopo: o `turnstileToken` previsto no LCT-4.3 foi **dispensado**
 * a pedido do time (MVP sem anti-spam por ora — ver TODO no route handler).
 */
export const nutrizSignupApiSchema = z.object({
  fullName: stringNotEmptySchema
    .min(3, 'Informe seu nome completo.')
    .max(120, 'Nome muito longo.'),
  phoneWhatsapp: whatsappSchema,
  state: z.string().trim().toUpperCase().pipe(ufSchema),
  city: stringNotEmptySchema
    .min(2, 'Informe sua cidade.')
    .max(100, 'Cidade invalida.'),
  lgpdConsent: z.literal(true, {
    message: 'E necessario aceitar a Politica de Privacidade para continuar.',
  }),
  sourceUtm: z.unknown().optional(),
})

export type NutrizSignupApiInput = z.infer<typeof nutrizSignupApiSchema>

/**
 * Atualizacao pelo admin. Todos os campos opcionais (atualiza apenas o que mudou).
 */
export const nutrizAdminUpdateSchema = z.object({
  fullName: stringNotEmptySchema
    .min(3, 'Nome muito curto.')
    .max(120)
    .optional(),
  email: emailSchema.optional(),
  neighborhood: z.string().trim().max(120).optional(),
  interestStatus: z.nativeEnum(InterestStatus).optional(),
  contactPreference: z.nativeEnum(ContactPreference).optional(),
  marketingConsent: z.boolean().optional(),
})

export type NutrizSignupInput = z.infer<typeof nutrizSignupSchema>
export type NutrizAdminUpdateInput = z.infer<typeof nutrizAdminUpdateSchema>
