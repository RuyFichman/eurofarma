'use server'

import { headers } from 'next/headers'

import { createSupabaseServerClient } from '@/lib/auth/supabase-server'
import {
  assertLoginNotRateLimited,
  clearFailedLoginAttempts,
  registerFailedLoginAttempt,
} from '@/lib/auth/login-rate-limit'
import {
  adminLoginSchema,
  adminPasswordResetSchema,
  type AdminLoginInput,
  type AdminPasswordResetInput,
} from '@/lib/validators/admin-auth'
import { ADMIN_LOGIN } from '@/lib/i18n/pt-br'

const FEEDBACK = ADMIN_LOGIN.form.feedback

export type LoginActionResult =
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

export type PasswordResetActionResult =
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

export async function loginAdminAction(
  input: AdminLoginInput,
): Promise<LoginActionResult> {
  // 1. Validação server-side.
  const parsed = adminLoginSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: FEEDBACK.genericError,
      fields: firstFieldErrors(parsed.error.flatten().fieldErrors),
    }
  }

  const { email, password } = parsed.data

  // 2. Rate limit por email (tentativas falhas).
  const limit = assertLoginNotRateLimited(email)
  if (!limit.allowed) {
    return {
      ok: false,
      code: 'RATE_LIMITED',
      message: FEEDBACK.rateLimited,
      retryAfterSeconds: limit.retryAfterSeconds,
    }
  }

  // 3. Autenticação via Supabase Auth (cookies de sessão definidos no SSR).
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Mensagem genérica — nunca expõe `error.message` do Supabase.
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

/** Monta a URL de redirect do reset a partir do host atual (ou NEXT_PUBLIC_SITE_URL). */
async function buildResetRedirectUrl(): Promise<string> {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (explicit) return `${explicit}/admin/login`

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const proto = headerList.get('x-forwarded-proto') ?? 'http'
  // Sem página de reset própria nesta sprint → volta para o login.
  return host
    ? `${proto}://${host}/admin/login`
    : 'http://localhost:3000/admin/login'
}

export async function requestAdminPasswordResetAction(
  input: AdminPasswordResetInput,
): Promise<PasswordResetActionResult> {
  const parsed = adminPasswordResetSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: FEEDBACK.resetNeedsEmail,
      fields: firstFieldErrors(parsed.error.flatten().fieldErrors),
    }
  }

  const { email } = parsed.data

  try {
    const supabase = await createSupabaseServerClient()
    const redirectTo = await buildResetRedirectUrl()
    // O Supabase responde igual exista ou não o email (anti-enumeração).
    await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  } catch {
    return { ok: false, code: 'AUTH_ERROR', message: FEEDBACK.resetError }
  }

  // Mensagem genérica — não revela se o email existe.
  return { ok: true, message: FEEDBACK.resetSuccess }
}
