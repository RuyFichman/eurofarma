import { z } from 'zod'

import { WHATSAPP_BOT } from '../i18n/pt-br'

export const REMINDER_DELAY_MS = 2 * 24 * 60 * 60 * 1000
export const REMINDER_KIND = 'KIT_DELIVERY_FOLLOW_UP' as const

const reminderPayloadSchema = z.object({
  reminderKind: z.literal(REMINDER_KIND),
  sourceHistoryId: z.string().trim().min(1),
  referenceAt: z.string().datetime({ offset: true }),
})

export type ReminderPayload = z.infer<typeof reminderPayloadSchema>

export function buildReminderPayload(params: {
  sourceHistoryId: string
  referenceAt: Date
}): ReminderPayload {
  return {
    reminderKind: REMINDER_KIND,
    sourceHistoryId: params.sourceHistoryId,
    referenceAt: params.referenceAt.toISOString(),
  }
}

export function parseReminderPayload(value: unknown): ReminderPayload | null {
  const parsed = reminderPayloadSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

/** Lembrete único de continuidade após o kit ser marcado como enviado. */
export function buildReminderNotificationBody(siteUrl: string): string {
  return WHATSAPP_BOT.reminders.jobBody.replace(
    '{areaUrl}',
    `${siteUrl.replace(/\/$/u, '')}/meu-agendamento`,
  )
}
