import { z } from 'zod'

import { isBrazilianState } from '../constants/brazilian-states'
import { SIGNUP } from '../i18n/pt-br'

const V = SIGNUP.validation

/**
 * Schema do formulário público de cadastro da nutriz (`SignupForm`, Client
 * Component). É **Prisma-free** de propósito: o schema "servidor" em
 * `lib/validators/nutriz.ts` importa `@prisma/client` e não pode transitar para
 * o bundle do navegador (mesma regra do `search-filters.ts`).
 *
 * Coleta sob LGPD — **sem CPF**: nome, e-mail, WhatsApp, estado, cidade,
 * senha e consentimento explícito (não pré-marcado).
 *
 * O e-mail e a senha entraram na Sprint 6.2, quando o cadastro passou a criar
 * uma **conta** (Supabase Auth) e não só um lead: sem conta não há a área em
 * que o agendamento informado ao chatbot aparece. As mesmas regras são
 * revalidadas no servidor por `nutrizSignupApiSchema` — validação de browser é
 * UX, a do servidor é integridade.
 */
export const signupFormSchema = z
  .object({
    fullName: z.string().trim().min(3, V.fullNameMin).max(120, V.fullNameMax),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, V.emailRequired)
      .max(254, V.emailInvalid)
      .email(V.emailInvalid),
    phoneWhatsapp: z
      .string()
      .trim()
      .refine(
        (value) => {
          const digits = value.replace(/\D/g, '')
          const len = digits.length
          return (
            len === 10 ||
            len === 11 ||
            ((len === 12 || len === 13) && digits.startsWith('55'))
          )
        },
        { message: V.whatsappInvalid },
      ),
    state: z
      .string()
      .trim()
      .toUpperCase()
      .refine((value) => isBrazilianState(value), {
        message: V.stateInvalid,
      }),
    city: z.string().trim().min(2, V.cityMin).max(100, V.cityMax),
    // Limites espelham `adminLoginSchema` e o que o Supabase Auth aceita.
    password: z.string().min(8, V.passwordMin).max(128, V.passwordMax),
    passwordConfirm: z.string().min(1, V.passwordMin),
    // Consentimento explícito e obrigatório (não pré-marcado) — LGPD, Princípio 6.
    lgpdConsent: z.boolean().refine((value) => value === true, {
      message: V.consentRequired,
    }),
  })
  // A confirmação existe só no cliente: o servidor recebe uma senha só. O erro
  // aponta para o campo de confirmação, que é onde a pessoa consegue corrigir.
  .refine((values) => values.password === values.passwordConfirm, {
    message: V.passwordMismatch,
    path: ['passwordConfirm'],
  })

/** Forma de entrada (campos do React Hook Form). */
export type SignupFormInput = z.input<typeof signupFormSchema>

/** Forma de saída (valores já normalizados após o resolver). */
export type SignupFormValues = z.output<typeof signupFormSchema>
