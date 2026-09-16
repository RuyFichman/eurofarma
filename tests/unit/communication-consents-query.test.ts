import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  profileFindFirst: vi.fn(),
  consentFindUnique: vi.fn(),
  consentCreate: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { findFirst: mocks.profileFindFirst },
    communicationConsentEvent: {
      findUnique: mocks.consentFindUnique,
      create: mocks.consentCreate,
    },
  },
}))

import {
  getReminderConsentPreference,
  setReminderConsent,
} from '../../lib/db/queries/communication-consents'

const PROFILE_ID = '11111111-1111-4111-8111-111111111111'

describe('consentimento auditável de lembretes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('considera desligado quando não existe decisão anterior', async () => {
    mocks.profileFindFirst.mockResolvedValue({ communicationConsents: [] })

    await expect(getReminderConsentPreference(PROFILE_ID)).resolves.toEqual({
      enabled: false,
      recordedAt: null,
      referenceDate: null,
    })
    expect(mocks.profileFindFirst).toHaveBeenCalledWith({
      where: { id: PROFILE_ID, deletedAt: null },
      select: {
        communicationConsents: {
          where: { purpose: 'REMINDERS_WHATSAPP' },
          orderBy: { sequence: 'desc' },
          take: 1,
          select: {
            decision: true,
            recordedAt: true,
            referenceDate: true,
          },
        },
      },
    })
  })

  it('registra concessão e retirada como novos eventos separados', async () => {
    mocks.profileFindFirst
      .mockResolvedValueOnce({ communicationConsents: [] })
      .mockResolvedValueOnce({
        communicationConsents: [{ decision: 'GRANTED' }],
      })
    mocks.consentCreate.mockResolvedValue({ id: 'consent-1' })

    await expect(
      setReminderConsent({
        nutrizProfileId: PROFILE_ID,
        enabled: true,
        source: 'WEB',
        referenceDate: new Date('2026-09-16T12:00:00.000Z'),
      }),
    ).resolves.toEqual({ status: 'UPDATED', enabled: true })
    await expect(
      setReminderConsent({
        nutrizProfileId: PROFILE_ID,
        enabled: false,
        source: 'WEB',
      }),
    ).resolves.toEqual({ status: 'UPDATED', enabled: false })

    expect(mocks.consentCreate).toHaveBeenNthCalledWith(1, {
      data: {
        nutrizProfileId: PROFILE_ID,
        purpose: 'REMINDERS_WHATSAPP',
        decision: 'GRANTED',
        source: 'WEB',
        policyVersion: '2026-09-16.reminders.v1',
        sourceEventId: undefined,
        referenceDate: new Date('2026-09-16T12:00:00.000Z'),
      },
      select: { id: true },
    })
    expect(mocks.consentCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({ decision: 'WITHDRAWN' }),
      }),
    )
  })

  it('não duplica evento quando a escolha vigente já é a solicitada', async () => {
    mocks.profileFindFirst.mockResolvedValue({
      communicationConsents: [{ decision: 'GRANTED' }],
    })

    await expect(
      setReminderConsent({
        nutrizProfileId: PROFILE_ID,
        enabled: true,
        source: 'WEB',
      }),
    ).resolves.toEqual({ status: 'UNCHANGED', enabled: true })
    expect(mocks.consentCreate).not.toHaveBeenCalled()
  })

  it('trata a reentrega da mesma mensagem do WhatsApp como idempotente', async () => {
    mocks.consentFindUnique.mockResolvedValue({
      nutrizProfileId: PROFILE_ID,
      purpose: 'REMINDERS_WHATSAPP',
    })
    mocks.profileFindFirst.mockResolvedValue({
      communicationConsents: [
        {
          decision: 'WITHDRAWN',
          recordedAt: new Date('2026-09-16T18:00:00.000Z'),
        },
      ],
    })

    await expect(
      setReminderConsent({
        nutrizProfileId: PROFILE_ID,
        enabled: true,
        source: 'WHATSAPP',
        sourceEventId: 'whatsapp:wamid.1',
      }),
    ).resolves.toEqual({ status: 'UNCHANGED', enabled: false })
    expect(mocks.consentCreate).not.toHaveBeenCalled()
  })

  it('não consulta o banco para perfil inválido', async () => {
    await expect(getReminderConsentPreference('inválido')).resolves.toBeNull()
    expect(mocks.profileFindFirst).not.toHaveBeenCalled()
  })
})
