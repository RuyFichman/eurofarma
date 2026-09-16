'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/auth/supabase-server'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { cancelNutrizAppointment } from '@/lib/db/queries/appointments'
import { setReminderConsent } from '@/lib/db/queries/communication-consents'
import {
  createNutrizExtractionLog,
  createNutrizWellbeingEntry,
  deleteNutrizExtractionLog,
  deleteNutrizWellbeingEntry,
} from '@/lib/db/queries/nutriz-personal-area'
import {
  extractionLogSchema,
  personalRecordIdSchema,
  wellbeingEntrySchema,
} from '@/lib/validators/nutriz-personal-area'
import {
  isValidLocalDate,
  formatLocalDate,
  localDateTimeToDate,
  localDateToDate,
} from '@/lib/utils/local-date-time'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

/**
 * Encerra a sessão da nutriz. O `signOut` limpa o cookie via SSR; o redirect
 * acontece mesmo se ele falhar, para nunca prender a pessoa numa tela sem saída.
 */
export async function logoutNutrizAction(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  } catch {
    // Falha ao contatar o Supabase não deve bloquear a saída da UI.
  }

  redirect('/')
}

const appointmentIdSchema = z.string().uuid()

/**
 * Marca o agendamento como cancelado.
 *
 * Server Action é endpoint próprio: o gate do layout protege a *tela*, não a
 * *mutação*. Por isso `requireNutrizUser()` é chamado **antes de qualquer
 * trabalho** e **fora do `try`** — o `redirect` interno do helper sinaliza por
 * exceção e seria engolido pelo `catch` (mesma regra da 5.8).
 *
 * A dona do agendamento não vem do cliente: o `id` recebido é cruzado com o
 * perfil da sessão dentro da consulta, então um id alheio simplesmente não
 * altera nada. O retorno é um booleano sem detalhe — a UI não precisa saber se
 * o id não existia, era de outra pessoa ou já estava cancelado, e distinguir
 * isso na resposta contaria a quem chamou algo sobre registros alheios.
 */
export async function cancelAppointmentAction(
  appointmentId: string,
): Promise<{ ok: boolean }> {
  const nutriz = await requireNutrizUser()

  try {
    const parsed = appointmentIdSchema.safeParse(appointmentId)
    if (!parsed.success) return { ok: false }

    const cancelled = await cancelNutrizAppointment({
      appointmentId: parsed.data,
      nutrizProfileId: nutriz.id,
    })
    if (!cancelled) return { ok: false }

    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // Só o erro técnico — nunca dado da nutriz.
      console.error('[cancelAppointmentAction]', error)
    }
    return { ok: false }
  }
}

const reminderPreferenceSchema = z.object({
  enabled: z.boolean(),
  referenceDate: z.string().optional(),
})

/** Ativa ou retira o opt-in de lembretes da própria nutriz. */
export async function setReminderConsentAction(input: {
  enabled: boolean
  referenceDate?: string
}): Promise<{ ok: boolean; enabled: boolean }> {
  const nutriz = await requireNutrizUser()
  const parsed = reminderPreferenceSchema.safeParse(input)
  if (!parsed.success) return { ok: false, enabled: false }

  const referenceDate = parsed.data.referenceDate?.trim() ?? ''
  if (
    parsed.data.enabled &&
    (!isValidLocalDate(referenceDate) ||
      referenceDate > formatLocalDate(new Date()))
  ) {
    return { ok: false, enabled: false }
  }

  try {
    const result = await setReminderConsent({
      nutrizProfileId: nutriz.id,
      enabled: parsed.data.enabled,
      source: 'WEB',
      referenceDate: parsed.data.enabled
        ? (localDateToDate(referenceDate) ?? undefined)
        : undefined,
    })
    if (result.status === 'NOT_FOUND') {
      return { ok: false, enabled: !parsed.data.enabled }
    }

    revalidatePath('/meu-agendamento')
    return { ok: true, enabled: result.enabled }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[setReminderConsentAction]', error)
    }
    return { ok: false, enabled: !parsed.data.enabled }
  }
}

type PersonalAreaActionFailure = {
  ok: false
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DATABASE_ERROR'
  fields?: Record<string, string>
}

type PersonalAreaActionSuccess = { ok: true }

type PersonalAreaActionResult =
  | PersonalAreaActionFailure
  | PersonalAreaActionSuccess

function getFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string' && !(field in fields)) {
      fields[field] = issue.message
    }
  }
  return fields
}

/** Registra uma sessão pessoal sem criar qualquer evento operacional. */
export async function createExtractionLogAction(
  input: unknown,
): Promise<PersonalAreaActionResult> {
  const nutriz = await requireNutrizUser()
  const parsed = extractionLogSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      fields: getFieldErrors(parsed.error),
    }
  }

  const recordedAt = localDateTimeToDate(parsed.data.recordedAt)
  if (!recordedAt || recordedAt > new Date()) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      fields: { recordedAt: NUTRIZ_AUTH.area.personal.validation.future },
    }
  }

  try {
    const created = await createNutrizExtractionLog({
      nutrizProfileId: nutriz.id,
      recordedAt,
      volumeMl: parsed.data.volumeMl,
    })
    if (!created) return { ok: false, code: 'NOT_FOUND' }
    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR' }
  }
}

/** Remove apenas o registro pessoal que pertence à nutriz autenticada. */
export async function deleteExtractionLogAction(
  extractionLogId: string,
): Promise<PersonalAreaActionResult> {
  const nutriz = await requireNutrizUser()
  const parsed = personalRecordIdSchema.safeParse(extractionLogId)
  if (!parsed.success) return { ok: false, code: 'VALIDATION_ERROR' }

  try {
    const deleted = await deleteNutrizExtractionLog({
      nutrizProfileId: nutriz.id,
      extractionLogId: parsed.data,
    })
    if (!deleted) return { ok: false, code: 'NOT_FOUND' }
    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR' }
  }
}

/** Registra bem-estar somente como uma opção simples e não clínica. */
export async function createWellbeingEntryAction(
  input: unknown,
): Promise<PersonalAreaActionResult> {
  const nutriz = await requireNutrizUser()
  const parsed = wellbeingEntrySchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      fields: getFieldErrors(parsed.error),
    }
  }

  try {
    const created = await createNutrizWellbeingEntry({
      nutrizProfileId: nutriz.id,
      feeling: parsed.data.feeling,
      recordedAt: new Date(),
    })
    if (!created) return { ok: false, code: 'NOT_FOUND' }
    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR' }
  }
}

/** Remove somente um registro de bem-estar da própria nutriz. */
export async function deleteWellbeingEntryAction(
  wellbeingEntryId: string,
): Promise<PersonalAreaActionResult> {
  const nutriz = await requireNutrizUser()
  const parsed = personalRecordIdSchema.safeParse(wellbeingEntryId)
  if (!parsed.success) return { ok: false, code: 'VALIDATION_ERROR' }

  try {
    const deleted = await deleteNutrizWellbeingEntry({
      nutrizProfileId: nutriz.id,
      wellbeingEntryId: parsed.data,
    })
    if (!deleted) return { ok: false, code: 'NOT_FOUND' }
    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR' }
  }
}
