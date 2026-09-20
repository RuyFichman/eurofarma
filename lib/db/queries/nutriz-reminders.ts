import type { NutrizReminderType, ReminderTimingOption } from '@prisma/client'

import { nutrizProfileIdSchema } from '../../validators/journey-status'
import { setReminderConsent } from './communication-consents'
import { prisma } from '../prisma'

function validProfileId(value: string): string | null {
  const id = value.trim()
  return nutrizProfileIdSchema.safeParse(id).success ? id : null
}

export type NutrizReminderPreferenceRow = {
  type: NutrizReminderType
  enabled: boolean
  timingOption: ReminderTimingOption
  targetDate: Date | null
  sourceExtractionLogId: string | null
  sourceExtractionLog: { recordedAt: Date; volumeMl: number } | null
}

export type LatestExtractionLog = {
  id: string
  recordedAt: Date
  volumeMl: number
}

export type NutrizReminderOverview = {
  preferences: NutrizReminderPreferenceRow[]
  latestExtractionLog: LatestExtractionLog | null
  kitDeliveryScheduledAt: Date | null
}

/**
 * Tudo que as telas de "Meus lembretes" precisam: as preferências já
 * configuradas e os dois dados reais que autorizam ativar um lembrete novo
 * (a sessão de extração mais recente e a visita de entrega do kit, quando o
 * admin já a registrou). Nunca inventa nenhum dos dois.
 */
export async function getNutrizReminderOverview(
  nutrizProfileId: string,
): Promise<NutrizReminderOverview | null> {
  const id = validProfileId(nutrizProfileId)
  if (!id) return null

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: {
      kitDeliveryScheduledAt: true,
      reminderPreferences: {
        select: {
          type: true,
          enabled: true,
          timingOption: true,
          targetDate: true,
          sourceExtractionLogId: true,
          sourceExtractionLog: { select: { recordedAt: true, volumeMl: true } },
        },
      },
      extractionLogs: {
        select: { id: true, recordedAt: true, volumeMl: true },
        orderBy: [{ recordedAt: 'desc' }, { id: 'desc' }],
        take: 1,
      },
    },
  })
  if (!profile) return null

  return {
    preferences: profile.reminderPreferences,
    latestExtractionLog: profile.extractionLogs[0] ?? null,
    kitDeliveryScheduledAt: profile.kitDeliveryScheduledAt,
  }
}

/**
 * Concede ou retira o consentimento guarda-chuva (`REMINDERS_WHATSAPP`)
 * conforme sobrar ou não alguma preferência ativa. `setReminderConsent` já é
 * idempotente — não escreve nada quando o estado não muda — por isso é
 * seguro chamar sempre, sem checar antes. Roda depois do upsert, fora da
 * mesma transação: na pior hipótese de falha aqui, a próxima ativação ou
 * desativação corrige o estado sozinha.
 */
async function syncReminderConsentUmbrella(
  nutrizProfileId: string,
): Promise<void> {
  const activeCount = await prisma.nutrizReminderPreference.count({
    where: { nutrizProfileId, enabled: true },
  })
  await setReminderConsent({
    nutrizProfileId,
    enabled: activeCount > 0,
    source: 'WEB',
  })
}

export type ReminderMutationResult =
  | { status: 'UPDATED' }
  | { status: 'NOT_FOUND' }

/** Ativa (ou reconfigura) o lembrete de validade do leite da última sessão registrada. */
export async function upsertMilkValidityReminder(input: {
  nutrizProfileId: string
  timingOption: Extract<
    ReminderTimingOption,
    'MILK_1_DAY_BEFORE' | 'MILK_2_DAYS_BEFORE' | 'MILK_3_DAYS_BEFORE'
  >
}): Promise<ReminderMutationResult> {
  const id = validProfileId(input.nutrizProfileId)
  if (!id) return { status: 'NOT_FOUND' }

  const latestLog = await prisma.extractionLog.findFirst({
    where: { nutrizProfileId: id },
    select: { id: true },
    orderBy: [{ recordedAt: 'desc' }, { id: 'desc' }],
  })
  if (!latestLog) return { status: 'NOT_FOUND' }

  await prisma.nutrizReminderPreference.upsert({
    where: {
      nutrizProfileId_type: { nutrizProfileId: id, type: 'MILK_VALIDITY' },
    },
    create: {
      nutrizProfileId: id,
      type: 'MILK_VALIDITY',
      enabled: true,
      timingOption: input.timingOption,
      sourceExtractionLogId: latestLog.id,
    },
    update: {
      enabled: true,
      timingOption: input.timingOption,
      sourceExtractionLogId: latestLog.id,
      targetDate: null,
    },
  })
  await syncReminderConsentUmbrella(id)
  return { status: 'UPDATED' }
}

/** Ativa (ou reconfigura) o lembrete autodeclarado de doação futura. */
export async function upsertFutureDonationReminder(input: {
  nutrizProfileId: string
  timingOption: Extract<
    ReminderTimingOption,
    | 'DONATION_7_DAYS_BEFORE'
    | 'DONATION_ON_DAY'
    | 'DONATION_7_DAYS_BEFORE_AND_ON_DAY'
  >
  targetDate: Date
}): Promise<ReminderMutationResult> {
  const id = validProfileId(input.nutrizProfileId)
  if (!id) return { status: 'NOT_FOUND' }

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  })
  if (!profile) return { status: 'NOT_FOUND' }

  await prisma.nutrizReminderPreference.upsert({
    where: {
      nutrizProfileId_type: { nutrizProfileId: id, type: 'FUTURE_DONATION' },
    },
    create: {
      nutrizProfileId: id,
      type: 'FUTURE_DONATION',
      enabled: true,
      timingOption: input.timingOption,
      targetDate: input.targetDate,
    },
    update: {
      enabled: true,
      timingOption: input.timingOption,
      targetDate: input.targetDate,
      sourceExtractionLogId: null,
    },
  })
  await syncReminderConsentUmbrella(id)
  return { status: 'UPDATED' }
}

/** Ativa (ou reconfigura) o lembrete da visita de entrega do kit já registrada pelo admin. */
export async function upsertKitDeliveryReminder(input: {
  nutrizProfileId: string
  timingOption: Extract<
    ReminderTimingOption,
    'KIT_MORNING_OF' | 'KIT_1_DAY_BEFORE' | 'KIT_1_DAY_BEFORE_AND_ON_DAY'
  >
}): Promise<ReminderMutationResult> {
  const id = validProfileId(input.nutrizProfileId)
  if (!id) return { status: 'NOT_FOUND' }

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: { kitDeliveryScheduledAt: true },
  })
  if (!profile?.kitDeliveryScheduledAt) return { status: 'NOT_FOUND' }

  await prisma.nutrizReminderPreference.upsert({
    where: {
      nutrizProfileId_type: { nutrizProfileId: id, type: 'KIT_DELIVERY' },
    },
    create: {
      nutrizProfileId: id,
      type: 'KIT_DELIVERY',
      enabled: true,
      timingOption: input.timingOption,
    },
    update: {
      enabled: true,
      timingOption: input.timingOption,
      targetDate: null,
      sourceExtractionLogId: null,
    },
  })
  await syncReminderConsentUmbrella(id)
  return { status: 'UPDATED' }
}

/** Desliga um lembrete sem apagar a configuração — reativar depois reaproveita a última escolha. */
export async function disableNutrizReminder(input: {
  nutrizProfileId: string
  type: NutrizReminderType
}): Promise<ReminderMutationResult> {
  const id = validProfileId(input.nutrizProfileId)
  if (!id) return { status: 'NOT_FOUND' }

  const result = await prisma.nutrizReminderPreference.updateMany({
    where: { nutrizProfileId: id, type: input.type },
    data: { enabled: false },
  })
  if (result.count === 0) return { status: 'NOT_FOUND' }

  await syncReminderConsentUmbrella(id)
  return { status: 'UPDATED' }
}
