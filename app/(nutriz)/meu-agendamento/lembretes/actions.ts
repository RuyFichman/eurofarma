'use server'

import { revalidatePath } from 'next/cache'

import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import {
  disableNutrizReminder,
  upsertFutureDonationReminder,
  upsertKitDeliveryReminder,
  upsertMilkValidityReminder,
} from '@/lib/db/queries/nutriz-reminders'
import { localDateToDate } from '@/lib/utils/local-date-time'
import {
  futureDonationReminderSchema,
  kitDeliveryReminderSchema,
  milkValidityReminderSchema,
  nutrizReminderTypeSchema,
} from '@/lib/validators/nutriz-reminders'

type ReminderActionResult =
  | { ok: true }
  | { ok: false; code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DATABASE_ERROR' }

/** Ativa o lembrete de validade do leite a partir da última sessão registrada. */
export async function activateMilkValidityReminderAction(
  input: unknown,
): Promise<ReminderActionResult> {
  const nutriz = await requireNutrizUser()
  const parsed = milkValidityReminderSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'VALIDATION_ERROR' }

  try {
    const result = await upsertMilkValidityReminder({
      nutrizProfileId: nutriz.id,
      timingOption: parsed.data.timingOption,
    })
    if (result.status === 'NOT_FOUND') return { ok: false, code: 'NOT_FOUND' }
    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR' }
  }
}

/** Ativa o lembrete autodeclarado de doação futura. */
export async function activateFutureDonationReminderAction(
  input: unknown,
): Promise<ReminderActionResult> {
  const nutriz = await requireNutrizUser()
  const parsed = futureDonationReminderSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'VALIDATION_ERROR' }

  const targetDate = localDateToDate(parsed.data.targetDate)
  if (!targetDate) return { ok: false, code: 'VALIDATION_ERROR' }

  try {
    const result = await upsertFutureDonationReminder({
      nutrizProfileId: nutriz.id,
      timingOption: parsed.data.timingOption,
      targetDate,
    })
    if (result.status === 'NOT_FOUND') return { ok: false, code: 'NOT_FOUND' }
    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR' }
  }
}

/** Ativa o lembrete da visita de entrega do kit já registrada pelo admin. */
export async function activateKitDeliveryReminderAction(
  input: unknown,
): Promise<ReminderActionResult> {
  const nutriz = await requireNutrizUser()
  const parsed = kitDeliveryReminderSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'VALIDATION_ERROR' }

  try {
    const result = await upsertKitDeliveryReminder({
      nutrizProfileId: nutriz.id,
      timingOption: parsed.data.timingOption,
    })
    if (result.status === 'NOT_FOUND') return { ok: false, code: 'NOT_FOUND' }
    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR' }
  }
}

/** Desliga qualquer um dos três lembretes, sem apagar a configuração salva. */
export async function disableReminderAction(
  type: unknown,
): Promise<ReminderActionResult> {
  const nutriz = await requireNutrizUser()
  const parsed = nutrizReminderTypeSchema.safeParse(type)
  if (!parsed.success) return { ok: false, code: 'VALIDATION_ERROR' }

  try {
    const result = await disableNutrizReminder({
      nutrizProfileId: nutriz.id,
      type: parsed.data,
    })
    if (result.status === 'NOT_FOUND') return { ok: false, code: 'NOT_FOUND' }
    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch {
    return { ok: false, code: 'DATABASE_ERROR' }
  }
}
