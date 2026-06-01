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
