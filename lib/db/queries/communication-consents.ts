import { Prisma } from '@prisma/client'

import { REMINDER_WHATSAPP_CONSENT_VERSION } from '../../consent/reminders'
import { nutrizProfileIdSchema } from '../../validators/journey-status'
import { prisma } from '../prisma'

export type ReminderConsentPreference = {
  enabled: boolean
  recordedAt: Date | null
}

export async function getReminderConsentPreference(
  nutrizProfileId: string,
): Promise<ReminderConsentPreference | null> {
  const id = nutrizProfileId.trim()
  if (!nutrizProfileIdSchema.safeParse(id).success) return null

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: {
      communicationConsents: {
        where: { purpose: 'REMINDERS_WHATSAPP' },
        orderBy: { sequence: 'desc' },
        take: 1,
        select: { decision: true, recordedAt: true },
      },
    },
  })
  if (!profile) return null

  const latest = profile.communicationConsents[0]
  return {
    enabled: latest?.decision === 'GRANTED',
    recordedAt: latest?.recordedAt ?? null,
  }
}

type SetReminderConsentInput = {
  nutrizProfileId: string
  enabled: boolean
  source: 'WEB' | 'WHATSAPP'
  sourceEventId?: string
}

export type SetReminderConsentResult =
  | { status: 'UPDATED'; enabled: boolean }
  | { status: 'UNCHANGED'; enabled: boolean }
  | { status: 'NOT_FOUND'; enabled: false }

function isDuplicateSourceEvent(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
}

/**
 * Acrescenta uma decisão ao ledger somente quando ela muda o estado vigente.
 * `sourceEventId` torna reentregas do webhook idempotentes sem alterar eventos
 * anteriores, que são protegidos como append-only pela migration do RF17.
 */
export async function setReminderConsent(
  input: SetReminderConsentInput,
): Promise<SetReminderConsentResult> {
  const id = input.nutrizProfileId.trim()
  if (!nutrizProfileIdSchema.safeParse(id).success) {
    return { status: 'NOT_FOUND', enabled: false }
  }

  const sourceEventId = input.sourceEventId?.trim() || undefined
  if (sourceEventId) {
    const replay = await prisma.communicationConsentEvent.findUnique({
      where: { sourceEventId },
      select: { nutrizProfileId: true, purpose: true },
    })
    if (replay) {
      const belongsToRequest =
        replay.nutrizProfileId === id && replay.purpose === 'REMINDERS_WHATSAPP'
      if (!belongsToRequest) return { status: 'NOT_FOUND', enabled: false }

      const current = await getReminderConsentPreference(id)
      return current
        ? { status: 'UNCHANGED', enabled: current.enabled }
        : { status: 'NOT_FOUND', enabled: false }
    }
  }

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: {
      communicationConsents: {
        where: { purpose: 'REMINDERS_WHATSAPP' },
        orderBy: { sequence: 'desc' },
        take: 1,
        select: { decision: true },
      },
    },
  })
  if (!profile) return { status: 'NOT_FOUND', enabled: false }

  const enabled = profile.communicationConsents[0]?.decision === 'GRANTED'
  if (enabled === input.enabled) {
    return { status: 'UNCHANGED', enabled }
  }

  try {
    await prisma.communicationConsentEvent.create({
      data: {
        nutrizProfileId: id,
        purpose: 'REMINDERS_WHATSAPP',
        decision: input.enabled ? 'GRANTED' : 'WITHDRAWN',
        source: input.source,
        policyVersion: REMINDER_WHATSAPP_CONSENT_VERSION,
        sourceEventId,
      },
      select: { id: true },
    })
  } catch (error) {
    if (!sourceEventId || !isDuplicateSourceEvent(error)) throw error

    const replay = await prisma.communicationConsentEvent.findUnique({
      where: { sourceEventId },
      select: { nutrizProfileId: true, purpose: true },
    })
    const belongsToRequest =
      replay?.nutrizProfileId === id && replay.purpose === 'REMINDERS_WHATSAPP'
    if (!belongsToRequest) return { status: 'NOT_FOUND', enabled: false }

    const current = await getReminderConsentPreference(id)
    return current
      ? { status: 'UNCHANGED', enabled: current.enabled }
      : { status: 'NOT_FOUND', enabled: false }
  }

  return { status: 'UPDATED', enabled: input.enabled }
}
