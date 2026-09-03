'use server'

import { headers } from 'next/headers'

import { prisma } from '@/lib/db/prisma'
import { createSupabaseServerClient } from '@/lib/auth/supabase-server'
import {
  assertLoginNotRateLimited,
  clearFailedLoginAttempts,
  registerFailedLoginAttempt,
} from '@/lib/auth/login-rate-limit'
import {
  nutrizLoginSchema,
  nutrizPasswordResetSchema,
  type NutrizLoginInput,
  type NutrizPasswordResetInput,
} from '@/lib/validators/nutriz-auth'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

const FEEDBACK = NUTRIZ_AUTH.login.feedback

export type NutrizLoginActionResult =
  | { ok: true }
  | {
      ok: false
      code:
        | 'VALIDATION_ERROR'
        | 'INVALID_CREDENTIALS'
        | 'RATE_LIMITED'
        | 'AUTH_ERROR'
      message: string
      fields?: Record<string, string>
      retryAfterSeconds?: number
    }

export type NutrizPasswordResetActionResult =
  | { ok: true; message: string }
  | {
      ok: false
      code: 'VALIDATION_ERROR' | 'AUTH_ERROR'
      message: string
      fields?: Record<string, string>
    }

/** Extrai a primeira mensagem de erro por campo de um ZodError achatado. */
function firstFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const first = messages?.[0]
    if (first) fields[key] = first
  }
  return fields
}

/**
 * Login da nutriz. Mesma estrutura do `loginAdminAction` (validar → rate limit
 * por e-mail → autenticar → erro genérico), com um passo a mais: confirmar que
 * a conta autenticada **é de uma nutriz**.
 *
 * Sem esse passo, credencial de admin digitada aqui abriria sessão no site
 * público e o cabeçalho passaria a oferecer "Meu agendamento" a quem não tem
 * perfil nenhum. Nesse caso a sessão é encerrada e a resposta é a mesma
 * mensagem genérica — a tela não confirma que aquele e-mail existe.
 */
export async function loginNutrizAction(
  input: NutrizLoginInput,
): Promise<NutrizLoginActionResult> {
  const parsed = nutrizLoginSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: FEEDBACK.genericError,
      fields: firstFieldErrors(parsed.error.flatten().fieldErrors),
    }
  }

  const { email, password } = parsed.data

  const limit = assertLoginNotRateLimited(email)
  if (!limit.allowed) {
    return {
      ok: false,
      code: 'RATE_LIMITED',
      message: FEEDBACK.rateLimited,
      retryAfterSeconds: limit.retryAfterSeconds,
    }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      // Nunca expõe `error.message` do Supabase.
      registerFailedLoginAttempt(email)
      return {
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: FEEDBACK.invalidCredentials,
      }
    }

    const profile = await prisma.nutrizProfile.findUnique({
      where: { authUserId: data.user.id },
      select: { id: true, deletedAt: true },
    })

    if (!profile || profile.deletedAt) {
      await supabase.auth.signOut()
      registerFailedLoginAttempt(email)
      return {
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: FEEDBACK.invalidCredentials,
      }
    }

    clearFailedLoginAttempts(email)
    return { ok: true }
  } catch {
    return { ok: false, code: 'AUTH_ERROR', message: FEEDBACK.genericError }
  }
}

/**
 * URL para onde o link do e-mail de recuperação aponta. Passa pelo route
 * handler `/auth/confirmar`, que é quem pode trocar o código por sessão e
 * gravar o cookie — um Server Component não grava cookie.
 */
async function buildResetRedirectUrl(): Promise<string> {
  const path = '/auth/confirmar?next=/redefinir-senha'
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (explicit) return `${explicit}${path}`

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const proto = headerList.get('x-forwarded-proto') ?? 'http'
  return host ? `${proto}://${host}${path}` : `http://localhost:3000${path}`
}

/**
 * Pede o e-mail de recuperação. A resposta é **sempre** a mesma, exista ou não
 * a conta (anti-enumeração) — inclusive quando o Supabase falha em enviar.
 */
export async function requestNutrizPasswordResetAction(
  input: NutrizPasswordResetInput,
): Promise<NutrizPasswordResetActionResult> {
  const parsed = nutrizPasswordResetSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: FEEDBACK.resetNeedsEmail,
      fields: firstFieldErrors(parsed.error.flatten().fieldErrors),
    }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const redirectTo = await buildResetRedirectUrl()
    await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo })
  } catch {
    return { ok: false, code: 'AUTH_ERROR', message: FEEDBACK.resetError }
  }

  return { ok: true, message: FEEDBACK.resetSuccess }
}
