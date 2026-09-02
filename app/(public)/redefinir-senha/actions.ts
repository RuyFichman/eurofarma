'use server'

import { createSupabaseServerClient } from '@/lib/auth/supabase-server'
import {
  nutrizNewPasswordSchema,
  type NutrizNewPasswordInput,
} from '@/lib/validators/nutriz-auth'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

const FEEDBACK = NUTRIZ_AUTH.newPassword.feedback

export type NewPasswordActionResult =
  | { ok: true; message: string }
  | {
      ok: false
      code: 'VALIDATION_ERROR' | 'INVALID_LINK' | 'AUTH_ERROR'
      message: string
      fields?: Record<string, string>
    }

/**
 * Grava a nova senha. Quem autoriza esta ação é a **sessão criada pelo link de
 * recuperação** (trocada em `/auth/confirmar`), por isso não há campo de senha
 * atual: a pessoa chegou aqui justamente por não lembrar dela.
 *
 * Sem sessão a resposta é `INVALID_LINK` e não um erro genérico — o caso comum
 * é link expirado ou já usado, e a pessoa precisa saber que deve pedir outro.
 */
export async function updateNutrizPasswordAction(
  input: NutrizNewPasswordInput,
): Promise<NewPasswordActionResult> {
  const parsed = nutrizNewPasswordSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const fields: Record<string, string> = {}
    for (const [key, messages] of Object.entries(fieldErrors)) {
      const first = messages?.[0]
      if (first) fields[key] = first
    }
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: FEEDBACK.genericError,
      fields,
    }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        ok: false,
        code: 'INVALID_LINK',
        message: FEEDBACK.invalidLink,
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    })

    if (error) {
      // Nunca expõe `error.message` do Supabase.
      return { ok: false, code: 'AUTH_ERROR', message: FEEDBACK.genericError }
    }

    return { ok: true, message: FEEDBACK.success }
  } catch {
    return { ok: false, code: 'AUTH_ERROR', message: FEEDBACK.genericError }
  }
}
