import { z } from 'zod'

import { isBrazilianState } from '../constants/brazilian-states'

/**
 * Schema do formulário público de cadastro da nutriz (`SignupForm`, Client
 * Component). É **Prisma-free** de propósito: o schema "servidor" em
 * `lib/validators/nutriz.ts` importa `@prisma/client` e não pode transitar para
 * o bundle do navegador (mesma regra do `search-filters.ts`).
 *
 * Coleta mínima sob LGPD — 5 campos, **sem CPF e sem senha**:
 * nome, WhatsApp, estado, cidade e consentimento explícito (não pré-marcado).
 * As mesmas regras serão revalidadas no servidor por `nutrizSignupSchema` quando
 * a rota `POST /api/nutriz` existir (Sprint 4.2).
 */
export const signupFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Informe seu nome completo.')
    .max(120, 'Nome muito longo.'),
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
      { message: 'WhatsApp inválido. Use DDD + número.' },
    ),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => isBrazilianState(value), {
      message: 'Selecione um estado válido.',
    }),
  city: z
    .string()
    .trim()
    .min(2, 'Informe sua cidade.')
    .max(100, 'Cidade inválida.'),
  // Consentimento explícito e obrigatório (não pré-marcado) — LGPD, Princípio 6.
  lgpdConsent: z.boolean().refine((value) => value === true, {
    message: 'É necessário aceitar a Política de Privacidade para continuar.',
  }),
})

/** Forma de entrada (campos do React Hook Form). */
export type SignupFormInput = z.input<typeof signupFormSchema>

/** Forma de saída (valores já normalizados após o resolver). */
export type SignupFormValues = z.output<typeof signupFormSchema>
