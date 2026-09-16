import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateMany: vi.fn(),
  findUniqueOrThrow: vi.fn(),
  transaction: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    notificationOutbox: {
      findMany: mocks.findMany,
      updateMany: mocks.updateMany,
      findUniqueOrThrow: mocks.findUniqueOrThrow,
    },
    $transaction: mocks.transaction,
  },
}))

import {
  claimNextNotificationOutbox,
  finalizeNotificationOutbox,
} from '../../lib/db/queries/notification-outbox'

const NOW = new Date('2026-09-16T15:00:00.000Z')

describe('persistência da outbox do RF17', () => {
  beforeEach(() => vi.clearAllMocks())

  it('faz claim condicional e carrega somente o consentimento mais recente', async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: 'outbox-1',
        status: 'PENDING',
        attemptCount: 0,
        maxAttempts: 5,
        lockToken: null,
      },
    ])
    mocks.updateMany.mockResolvedValue({ count: 1 })
    mocks.findUniqueOrThrow.mockResolvedValue({
      id: 'outbox-1',
      lockToken: 'generated-lock',
      idempotencyKey: 'journey-status:history-1',
      attemptCount: 1,
      maxAttempts: 5,
      journeyStatusHistory: { toStatus: 'FORM_RECEIVED' },
      nutrizProfile: {
        phoneWhatsapp: '5511999998888',
        deletedAt: null,
        communicationConsents: [
          { purpose: 'JOURNEY_STATUS_WHATSAPP', decision: 'GRANTED' },
        ],
      },
    })

    await expect(claimNextNotificationOutbox(NOW)).resolves.toEqual(
      expect.objectContaining({
        id: 'outbox-1',
        attemptNumber: 1,
        hasCurrentConsent: true,
      }),
    )
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'outbox-1',
        status: 'PENDING',
        attemptCount: 0,
        lockToken: null,
      },
      data: {
        status: 'PROCESSING',
        attemptCount: 1,
        lockedAt: NOW,
        lockToken: expect.any(String),
      },
    })
    expect(mocks.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          nutrizProfile: expect.objectContaining({
            select: expect.objectContaining({
              communicationConsents: expect.objectContaining({
                orderBy: { sequence: 'desc' },
              }),
            }),
          }),
        }),
      }),
    )
  })

  it('não entrega o mesmo candidato quando outro worker vence o claim', async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: 'outbox-1',
        status: 'PENDING',
        attemptCount: 0,
        maxAttempts: 5,
        lockToken: null,
      },
    ])
    mocks.updateMany.mockResolvedValue({ count: 0 })

    await expect(claimNextNotificationOutbox(NOW)).resolves.toBeNull()
    expect(mocks.findUniqueOrThrow).not.toHaveBeenCalled()
  })

  it('revalida a finalidade correta para um lembrete', async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: 'outbox-reminder-1',
        status: 'PENDING',
        attemptCount: 0,
        maxAttempts: 5,
        lockToken: null,
      },
    ])
    mocks.updateMany.mockResolvedValue({ count: 1 })
    mocks.findUniqueOrThrow.mockResolvedValue({
      id: 'outbox-reminder-1',
      lockToken: 'generated-lock',
      idempotencyKey: 'reminder:history-1',
      kind: 'REMINDER',
      payload: {
        reminderKind: 'KIT_DELIVERY_FOLLOW_UP',
        sourceHistoryId: 'history-1',
        referenceAt: '2026-09-13T15:00:00.000Z',
      },
      attemptCount: 1,
      maxAttempts: 5,
      journeyStatusHistory: null,
      nutrizProfile: {
        phoneWhatsapp: '5511999998888',
        deletedAt: null,
        communicationConsents: [
          { purpose: 'JOURNEY_STATUS_WHATSAPP', decision: 'WITHDRAWN' },
          { purpose: 'REMINDERS_WHATSAPP', decision: 'GRANTED' },
        ],
      },
    })

    await expect(claimNextNotificationOutbox(NOW)).resolves.toEqual(
      expect.objectContaining({
        kind: 'REMINDER',
        hasCurrentConsent: true,
      }),
    )
  })

  it('finaliza a fila e a auditoria na mesma transação', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 })
    const createAttempt = vi.fn().mockResolvedValue({ id: 'attempt-1' })
    mocks.transaction.mockImplementation(
      async (callback: (client: unknown) => Promise<void>) =>
        callback({
          notificationOutbox: { updateMany },
          notificationDeliveryAttempt: { create: createAttempt },
        }),
    )

    await finalizeNotificationOutbox({
      claim: {
        id: 'outbox-1',
        lockToken: 'lock-1',
        attemptNumber: 2,
      },
      status: 'FAILED',
      outcome: 'FAILED',
      errorCode: 'PERMANENT_FAILURE',
      now: NOW,
    })

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'outbox-1',
          status: 'PROCESSING',
          lockToken: 'lock-1',
          attemptCount: 2,
        },
        data: expect.objectContaining({
          status: 'FAILED',
          failedAt: NOW,
          lastErrorCode: 'PERMANENT_FAILURE',
        }),
      }),
    )
    expect(createAttempt).toHaveBeenCalledWith({
      data: {
        outboxId: 'outbox-1',
        attemptNumber: 2,
        outcome: 'FAILED',
        providerMessageId: null,
        errorCode: 'PERMANENT_FAILURE',
        attemptedAt: NOW,
      },
    })
  })

  it('não grava auditoria se o lock foi perdido', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 })
    const createAttempt = vi.fn()
    mocks.transaction.mockImplementation(
      async (callback: (client: unknown) => Promise<void>) =>
        callback({
          notificationOutbox: { updateMany },
          notificationDeliveryAttempt: { create: createAttempt },
        }),
    )

    await expect(
      finalizeNotificationOutbox({
        claim: {
          id: 'outbox-1',
          lockToken: 'stale-lock',
          attemptNumber: 1,
        },
        status: 'SENT',
        outcome: 'SENT',
        providerMessageId: 'provider-1',
        now: NOW,
      }),
    ).rejects.toThrow('NOTIFICATION_OUTBOX_CLAIM_LOST')
    expect(createAttempt).not.toHaveBeenCalled()
  })
})
