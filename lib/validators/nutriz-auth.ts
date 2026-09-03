import { z } from 'zod'

import { NUTRIZ_AUTH } from '../i18n/pt-br'

const LOGIN = NUTRIZ_AUTH.login.validation
const NEW_PASSWORD = NUTRIZ_AUTH.newPassword.validation

/**
 * Schemas de sessão da nutriz (Sprint 6.3). **Prisma-free**: são consumidos por
 * Client Components (`login-form.tsx`, `new-password-form.tsx`), e nada
 * importado por Client Component pode transitar para `@prisma/client`.
 *
 * São o par do `adminLoginSchema`, mas separados de propósito: as mensagens têm
 * o tom do público e as regras podem divergir sem afetar o painel.
 */
export const nutrizLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, LOGIN.emailRequired)
    .max(254, LOGIN.emailInvalid)
    .email(LOGIN.emailInvalid),
  password: z
    .string()
    .min(1, LOGIN.passwordRequired)
    .min(8, LOGIN.passwordMin)
    .max(128, LOGIN.passwordMax),
})

export type NutrizLoginInput = z.infer<typeof nutrizLoginSchema>

/** Pedido de recuperação: só o e-mail (normalizado). */
export const nutrizPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, LOGIN.emailRequired)
    .max(254, LOGIN.emailInvalid)
    .email(LOGIN.emailInvalid),
})

export type NutrizPasswordResetInput = z.infer<typeof nutrizPasswordResetSchema>

/**
 * Nova senha vinda do link de recuperação. Os limites espelham os do cadastro
 * (`signupFormSchema`) e os do login — se um mudar, os três mudam, senão a
 * pessoa cria no reset uma senha que o login recusa.
 */
export const nutrizNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, NEW_PASSWORD.passwordMin)
      .max(128, NEW_PASSWORD.passwordMax),
    passwordConfirm: z.string().min(1, NEW_PASSWORD.passwordMin),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    message: NEW_PASSWORD.passwordMismatch,
    path: ['passwordConfirm'],
  })

export type NutrizNewPasswordInput = z.infer<typeof nutrizNewPasswordSchema>
