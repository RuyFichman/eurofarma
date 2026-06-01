import { z } from 'zod'

/** As 27 unidades federativas oficiais do Brasil. */
export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

/** Valida que o valor e uma sigla de UF brasileira valida. */
export const ufSchema = z.enum(UFS, {
  errorMap: () => ({ message: 'UF invalida. Use a sigla do estado (ex.: SP).' }),
})

/**
 * Normaliza e valida numero de WhatsApp.
 * Remove tudo que nao for digito, aceita 10/11 digitos (DDD + numero) ou 12/13
 * (com codigo de pais 55). Resultado final: string de 12 ou 13 digitos iniciando em 55.
 */
export const whatsappSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine(
    (digits) => {
      const len = digits.length
      return (
        len === 10 ||
        len === 11 ||
        ((len === 12 || len === 13) && digits.startsWith('55'))
      )
    },
    { message: 'WhatsApp invalido. Use formato com DDD.' },
  )
  .transform((digits) =>
    digits.length === 10 || digits.length === 11 ? `55${digits}` : digits,
  )

/**
 * Normaliza e valida telefone brasileiro (fixo ou celular).
 * Remove formatacao e aceita 10 (fixo) ou 11 (celular) digitos. Retorna apenas digitos.
 */
export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((digits) => digits.length === 10 || digits.length === 11, {
    message: 'Telefone invalido. Use formato com DDD.',
  })

/**
 * Normaliza e valida CEP. Remove formatacao, exige 8 digitos e retorna no formato `00000-000`.
 */
export const cepSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((digits) => digits.length === 8, {
    message: 'CEP invalido. Use formato 00000-000.',
  })
  .transform((digits) => `${digits.slice(0, 5)}-${digits.slice(5)}`)

/** E-mail validado, normalizado para minusculas e sem espacos nas pontas. */
export const emailSchema = z
  .string()
  .email({ message: 'E-mail invalido.' })
  .toLowerCase()
  .trim()

/** String obrigatoria: aplica trim e exige ao menos 1 caractere. */
export const stringNotEmptySchema = z.string().trim().min(1, 'Campo obrigatorio.')
