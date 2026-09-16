import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  historyFindMany: vi.fn(),
  outboxCreateMany: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    journeyStatusHistory: { findMany: mocks.historyFindMany },
    notificationOutbox: { createMany: mocks.outboxCreateMany },
  },
}))

import { enqueueDueReminderOutbox } from '../../lib/db/queries/reminder-outbox'

const NOW = new Date('2026-09-16T15:00:00.000Z')
const CHANGED_AT = new Date('2026-09-13T15:00:00.000Z')

describe('job de lembretes na outbox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.outboxCreateMany.mockResolvedValue({ count: 1 })
  })

  it('seleciona KIT_SENT vencido, exige opt-in vigente e grava payload idempotente', async () => {
    mocks.historyFindMany.mockResolvedValue([
      {
        id: 'history-1',
        nutrizProfileId: 'profile-1',
        changedAt: CHANGED_AT,
        nutrizProfile: {
          communicationConsents: [{ id: 'consent-1', decision: 'GRANTED' }],
        },
      },
    ])

    await expect(enqueueDueReminderOutbox({ now: NOW })).resolves.toEqual({
      examined: 1,
      eligible: 1,
      enqueued: 1,
      skippedWithoutConsent: 0,
    })

    expect(mocks.historyFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          toStatus: 'KIT_SENT',
          changedAt: { lte: new Date('2026-09-14T15:00:00.000Z') },
        }),
        take: 100,
      }),
    )
    expect(mocks.outboxCreateMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          idempotencyKey: 'reminder:history-1',
          kind: 'REMINDER',
          status: 'PENDING',
          nutrizProfileId: 'profile-1',
          consentEventId: 'consent-1',
          journeyStatusHistoryId: null,
          payload: {
            reminderKind: 'KIT_DELIVERY_FOLLOW_UP',
            sourceHistoryId: 'history-1',
            referenceAt: '2026-09-13T15:00:00.000Z',
          },
          availableAt: NOW,
        }),
      ],
      skipDuplicates: true,
    })
  })

  it('não cria lembrete para consentimento retirado', async () => {
    mocks.historyFindMany.mockResolvedValue([
      {
        id: 'history-2',
        nutrizProfileId: 'profile-2',
        changedAt: CHANGED_AT,
        nutrizProfile: {
          communicationConsents: [{ id: 'consent-2', decision: 'WITHDRAWN' }],
        },
      },
    ])

    await expect(enqueueDueReminderOutbox({ now: NOW })).resolves.toMatchObject(
      {
        examined: 1,
        eligible: 0,
        enqueued: 0,
        skippedWithoutConsent: 1,
      },
    )
    expect(mocks.outboxCreateMany).not.toHaveBeenCalled()
  })
})
