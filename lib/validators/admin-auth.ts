import { z } from 'zod'

import { ADMIN_LOGIN } from '../i18n/pt-br'

const V = ADMIN_LOGIN.form.validation

/** Login admin: email (normalizado) + senha. Revalidado no client e no server. */
export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, V.emailRequired)
    .max(254, V.emailInvalid)
    .email(V.emailInvalid),
  password: z
    .string()
    .min(1, V.passwordRequired)
    .min(8, V.passwordMin)
    .max(128, V.passwordMax),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>

/** Recuperação de senha admin: apenas o email (normalizado). */
export const adminPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, V.emailRequired)
    .max(254, V.emailInvalid)
    .email(V.emailInvalid),
})

export type AdminPasswordResetInput = z.infer<typeof adminPasswordResetSchema>
