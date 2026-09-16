import type { Prisma } from '@prisma/client'

import {
  REMINDER_DELAY_MS,
  buildReminderPayload,
} from '../../notifications/reminders'
import { prisma } from '../prisma'

const DEFAULT_LIMIT = 100

export type ReminderJobSummary = {
  examined: number
  eligible: number
  enqueued: number
  skippedWithoutConsent: number
}

type ReminderCandidate = {
  id: string
  nutrizProfileId: string
  changedAt: Date
  nutrizProfile: {
    communicationConsents: Array<{
      id: string
      decision: 'GRANTED' | 'WITHDRAWN'
      referenceDate: Date | null
    }>
  }
}

const REMINDER_CANDIDATE_SELECT = {
  id: true,
  nutrizProfileId: true,
  changedAt: true,
  nutrizProfile: {
    select: {
      communicationConsents: {
        where: { purpose: 'REMINDERS_WHATSAPP' },
        orderBy: { sequence: 'desc' },
        take: 1,
        select: { id: true, decision: true, referenceDate: true },
      },
    },
  },
} as const satisfies Prisma.JourneyStatusHistorySelect

/**
 * Enfileira no máximo um lembrete por passagem por `KIT_SENT`, dois dias após
 * a data em que a equipe registrou essa etapa. A chave única da outbox torna
 * reexecuções e dois workers concorrentes idempotentes.
 */
export async function enqueueDueReminderOutbox(params?: {
  now?: Date
  limit?: number
  delayMs?: number
}): Promise<ReminderJobSummary> {
  const now = params?.now ?? new Date()
  const delayMs = params?.delayMs ?? REMINDER_DELAY_MS
  const limit = Math.min(
    DEFAULT_LIMIT,
    Math.max(1, Math.floor(params?.limit ?? DEFAULT_LIMIT)),
  )
  const dueBefore = new Date(now.getTime() - delayMs)

  const candidates = (await prisma.journeyStatusHistory.findMany({
    where: {
      toStatus: 'KIT_SENT',
      changedAt: { lte: dueBefore },
      nutrizProfile: {
        deletedAt: null,
        journeyStatus: 'KIT_SENT',
        communicationConsents: {
          some: { purpose: 'REMINDERS_WHATSAPP' },
        },
      },
    },
    select: REMINDER_CANDIDATE_SELECT,
    orderBy: [{ changedAt: 'asc' }, { id: 'asc' }],
    take: limit,
  })) as ReminderCandidate[]

  const rows = candidates.flatMap((candidate) => {
    const consent = candidate.nutrizProfile.communicationConsents[0]
    if (consent?.decision !== 'GRANTED') return []

    return [
      {
        idempotencyKey: `reminder:${candidate.id}`,
        kind: 'REMINDER' as const,
        status: 'PENDING' as const,
        nutrizProfileId: candidate.nutrizProfileId,
        journeyStatusHistoryId: null,
        consentEventId: consent.id,
        payload: buildReminderPayload({
          sourceHistoryId: candidate.id,
          referenceAt: consent.referenceDate ?? candidate.changedAt,
        }),
        availableAt: now,
      },
    ]
  })

  const created = rows.length
    ? await prisma.notificationOutbox.createMany({
        data: rows,
        skipDuplicates: true,
      })
    : { count: 0 }

  return {
    examined: candidates.length,
    eligible: rows.length,
    enqueued: created.count,
    skippedWithoutConsent: candidates.length - rows.length,
  }
}
