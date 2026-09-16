import { randomUUID } from 'node:crypto'
import type {
  CommunicationConsentPurpose,
  NotificationDeliveryAttemptOutcome,
  NotificationOutboxKind,
  NotificationOutboxStatus,
  Prisma,
} from '@prisma/client'

import type { JourneyStatusValue } from '../../journey/status'
import { NOTIFICATION_LOCK_TIMEOUT_MS } from '../../notifications/journey-status-notification'
import { prisma } from '../prisma'

export type ClaimedNotification = {
  id: string
  lockToken: string
  idempotencyKey: string
  kind: NotificationOutboxKind
  attemptNumber: number
  maxAttempts: number
  toStatus: JourneyStatusValue | null
  payload: Prisma.JsonValue | null
  phoneWhatsapp: string
  profileDeleted: boolean
  hasCurrentConsent: boolean
}

const CLAIM_SELECT = {
  id: true,
  lockToken: true,
  idempotencyKey: true,
  kind: true,
  payload: true,
  attemptCount: true,
  maxAttempts: true,
  journeyStatusHistory: { select: { toStatus: true } },
  nutrizProfile: {
    select: {
      phoneWhatsapp: true,
      deletedAt: true,
      communicationConsents: {
        where: {
          purpose: {
            in: ['JOURNEY_STATUS_WHATSAPP', 'REMINDERS_WHATSAPP'],
          },
        },
        orderBy: { sequence: 'desc' },
        select: { purpose: true, decision: true },
      },
    },
  },
} as const satisfies Prisma.NotificationOutboxSelect

/**
 * Claim otimista: dois workers podem ler o mesmo candidato, mas somente um
 * consegue trocar o estado/lock com o snapshot observado. Locks abandonados
 * voltam a ser elegíveis depois de cinco minutos.
 */
export async function claimNextNotificationOutbox(
  now: Date,
): Promise<ClaimedNotification | null> {
  const staleBefore = new Date(now.getTime() - NOTIFICATION_LOCK_TIMEOUT_MS)
  const candidates = await prisma.notificationOutbox.findMany({
    where: {
      availableAt: { lte: now },
      OR: [
        { status: { in: ['PENDING', 'RETRY_SCHEDULED'] }, lockToken: null },
        { status: 'PROCESSING', lockedAt: { lte: staleBefore } },
      ],
    },
    select: {
      id: true,
      status: true,
      attemptCount: true,
      maxAttempts: true,
      lockToken: true,
    },
    orderBy: [{ availableAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    take: 10,
  })

  for (const candidate of candidates) {
    const isReclaim = candidate.status === 'PROCESSING'
    if (!isReclaim && candidate.attemptCount >= candidate.maxAttempts) continue
    if (isReclaim && candidate.attemptCount < 1) continue

    const lockToken = randomUUID()
    const attemptNumber = isReclaim
      ? candidate.attemptCount
      : candidate.attemptCount + 1
    const claimed = await prisma.notificationOutbox.updateMany({
      where: {
        id: candidate.id,
        status: candidate.status,
        attemptCount: candidate.attemptCount,
        lockToken: candidate.lockToken,
      },
      data: {
        status: 'PROCESSING',
        attemptCount: attemptNumber,
        lockedAt: now,
        lockToken,
      },
    })
    if (claimed.count !== 1) continue

    const row = await prisma.notificationOutbox.findUniqueOrThrow({
      where: { id: candidate.id },
      select: CLAIM_SELECT,
    })
    const consentPurpose: CommunicationConsentPurpose =
      row.kind === 'REMINDER' ? 'REMINDERS_WHATSAPP' : 'JOURNEY_STATUS_WHATSAPP'
    const currentConsent = row.nutrizProfile.communicationConsents.find(
      (consent) => consent.purpose === consentPurpose,
    )

    return {
      id: row.id,
      lockToken: row.lockToken!,
      idempotencyKey: row.idempotencyKey,
      kind: row.kind,
      attemptNumber: row.attemptCount,
      maxAttempts: row.maxAttempts,
      toStatus:
        (row.journeyStatusHistory?.toStatus as
          | JourneyStatusValue
          | undefined) ?? null,
      payload: row.payload,
      phoneWhatsapp: row.nutrizProfile.phoneWhatsapp,
      profileDeleted: row.nutrizProfile.deletedAt !== null,
      hasCurrentConsent: currentConsent?.decision === 'GRANTED',
    }
  }

  return null
}

type FinalizeNotificationInput = {
  claim: Pick<ClaimedNotification, 'id' | 'lockToken' | 'attemptNumber'>
  status: Extract<
    NotificationOutboxStatus,
    'SENT' | 'RETRY_SCHEDULED' | 'FAILED' | 'SUPPRESSED'
  >
  outcome: NotificationDeliveryAttemptOutcome
  now: Date
  availableAt?: Date
  providerMessageId?: string
  errorCode?: string
}

/** Atualiza a fila e grava a tentativa na mesma transação. */
export async function finalizeNotificationOutbox(
  input: FinalizeNotificationInput,
): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    const updated = await transaction.notificationOutbox.updateMany({
      where: {
        id: input.claim.id,
        status: 'PROCESSING',
        lockToken: input.claim.lockToken,
        attemptCount: input.claim.attemptNumber,
      },
      data: {
        status: input.status,
        availableAt: input.availableAt ?? input.now,
        lockedAt: null,
        lockToken: null,
        sentAt: input.status === 'SENT' ? input.now : null,
        failedAt: input.status === 'FAILED' ? input.now : null,
        providerMessageId: input.providerMessageId ?? null,
        lastErrorCode: input.errorCode ?? null,
        lastErrorAt: input.errorCode ? input.now : null,
      },
    })
    if (updated.count !== 1) {
      throw new Error('NOTIFICATION_OUTBOX_CLAIM_LOST')
    }

    await transaction.notificationDeliveryAttempt.create({
      data: {
        outboxId: input.claim.id,
        attemptNumber: input.claim.attemptNumber,
        outcome: input.outcome,
        providerMessageId: input.providerMessageId ?? null,
        errorCode: input.errorCode ?? null,
        attemptedAt: input.now,
      },
    })
  })
}
