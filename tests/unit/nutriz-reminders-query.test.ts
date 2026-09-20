import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  nutrizFindFirst: vi.fn(),
  extractionLogFindFirst: vi.fn(),
  preferenceUpsert: vi.fn(),
  preferenceUpdateMany: vi.fn(),
  preferenceCount: vi.fn(),
  setReminderConsent: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { findFirst: mocks.nutrizFindFirst },
    extractionLog: { findFirst: mocks.extractionLogFindFirst },
    nutrizReminderPreference: {
      upsert: mocks.preferenceUpsert,
      updateMany: mocks.preferenceUpdateMany,
      count: mocks.preferenceCount,
    },
  },
}))

vi.mock('../../lib/db/queries/communication-consents', () => ({
  setReminderConsent: mocks.setReminderConsent,
}))

import {
  disableNutrizReminder,
  getNutrizReminderOverview,
  upsertFutureDonationReminder,
  upsertKitDeliveryReminder,
  upsertMilkValidityReminder,
} from '../../lib/db/queries/nutriz-reminders'

const PROFILE_ID = '11111111-1111-4111-8111-111111111111'

describe('lib/db/queries/nutriz-reminders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.preferenceCount.mockResolvedValue(1)
    mocks.setReminderConsent.mockResolvedValue({
      status: 'UPDATED',
      enabled: true,
    })
  })

  describe('getNutrizReminderOverview', () => {
    it('retorna null para identificador inválido', async () => {
      await expect(getNutrizReminderOverview('   ')).resolves.toBeNull()
      expect(mocks.nutrizFindFirst).not.toHaveBeenCalled()
    })

    it('retorna null quando o perfil não existe ou foi excluído', async () => {
      mocks.nutrizFindFirst.mockResolvedValue(null)
      await expect(getNutrizReminderOverview(PROFILE_ID)).resolves.toBeNull()
    })

    it('monta a sessão mais recente, a visita do kit e as preferências', async () => {
      mocks.nutrizFindFirst.mockResolvedValue({
        kitDeliveryScheduledAt: new Date('2026-09-25T19:00:00.000Z'),
        reminderPreferences: [
          {
            type: 'MILK_VALIDITY',
            enabled: true,
            timingOption: 'MILK_2_DAYS_BEFORE',
            targetDate: null,
            sourceExtractionLogId: 'log-1',
            sourceExtractionLog: {
              recordedAt: new Date('2026-09-19T20:36:00.000Z'),
              volumeMl: 200,
            },
          },
        ],
        extractionLogs: [
          {
            id: 'log-1',
            recordedAt: new Date('2026-09-19T20:36:00.000Z'),
            volumeMl: 200,
          },
        ],
      })

      await expect(getNutrizReminderOverview(PROFILE_ID)).resolves.toEqual({
        preferences: [
          expect.objectContaining({ type: 'MILK_VALIDITY', enabled: true }),
        ],
        latestExtractionLog: {
          id: 'log-1',
          recordedAt: new Date('2026-09-19T20:36:00.000Z'),
          volumeMl: 200,
        },
        kitDeliveryScheduledAt: new Date('2026-09-25T19:00:00.000Z'),
      })
    })
  })

  describe('upsertMilkValidityReminder', () => {
    it('não ativa sem nenhuma sessão de extração registrada', async () => {
      mocks.extractionLogFindFirst.mockResolvedValue(null)

      await expect(
        upsertMilkValidityReminder({
          nutrizProfileId: PROFILE_ID,
          timingOption: 'MILK_2_DAYS_BEFORE',
        }),
      ).resolves.toEqual({ status: 'NOT_FOUND' })
      expect(mocks.preferenceUpsert).not.toHaveBeenCalled()
    })

    it('aponta sempre para a sessão mais recente, nunca a informada pelo cliente', async () => {
      mocks.extractionLogFindFirst.mockResolvedValue({ id: 'log-latest' })

      await expect(
        upsertMilkValidityReminder({
          nutrizProfileId: PROFILE_ID,
          timingOption: 'MILK_1_DAY_BEFORE',
        }),
      ).resolves.toEqual({ status: 'UPDATED' })

      expect(mocks.preferenceUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            nutrizProfileId_type: {
              nutrizProfileId: PROFILE_ID,
              type: 'MILK_VALIDITY',
            },
          },
          create: expect.objectContaining({
            sourceExtractionLogId: 'log-latest',
            timingOption: 'MILK_1_DAY_BEFORE',
          }),
        }),
      )
      expect(mocks.setReminderConsent).toHaveBeenCalledWith(
        expect.objectContaining({ nutrizProfileId: PROFILE_ID, enabled: true }),
      )
    })
  })

  describe('upsertFutureDonationReminder', () => {
    it('não ativa quando o perfil não existe', async () => {
      mocks.nutrizFindFirst.mockResolvedValue(null)

      await expect(
        upsertFutureDonationReminder({
          nutrizProfileId: PROFILE_ID,
          timingOption: 'DONATION_ON_DAY',
          targetDate: new Date('2026-11-15T12:00:00.000Z'),
        }),
      ).resolves.toEqual({ status: 'NOT_FOUND' })
      expect(mocks.preferenceUpsert).not.toHaveBeenCalled()
    })

    it('grava a data autodeclarada sem tocar na sessão de extração', async () => {
      mocks.nutrizFindFirst.mockResolvedValue({ id: PROFILE_ID })

      await upsertFutureDonationReminder({
        nutrizProfileId: PROFILE_ID,
        timingOption: 'DONATION_7_DAYS_BEFORE_AND_ON_DAY',
        targetDate: new Date('2026-11-15T12:00:00.000Z'),
      })

      expect(mocks.preferenceUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            targetDate: new Date('2026-11-15T12:00:00.000Z'),
            timingOption: 'DONATION_7_DAYS_BEFORE_AND_ON_DAY',
          }),
          update: expect.objectContaining({ sourceExtractionLogId: null }),
        }),
      )
    })
  })

  describe('upsertKitDeliveryReminder', () => {
    it('não ativa sem data/horário registrados pelo admin', async () => {
      mocks.nutrizFindFirst.mockResolvedValue({ kitDeliveryScheduledAt: null })

      await expect(
        upsertKitDeliveryReminder({
          nutrizProfileId: PROFILE_ID,
          timingOption: 'KIT_1_DAY_BEFORE',
        }),
      ).resolves.toEqual({ status: 'NOT_FOUND' })
      expect(mocks.preferenceUpsert).not.toHaveBeenCalled()
    })

    it('ativa quando o admin já registrou a visita', async () => {
      mocks.nutrizFindFirst.mockResolvedValue({
        kitDeliveryScheduledAt: new Date('2026-09-25T19:00:00.000Z'),
      })

      await expect(
        upsertKitDeliveryReminder({
          nutrizProfileId: PROFILE_ID,
          timingOption: 'KIT_MORNING_OF',
        }),
      ).resolves.toEqual({ status: 'UPDATED' })
      expect(mocks.preferenceUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            type: 'KIT_DELIVERY',
            timingOption: 'KIT_MORNING_OF',
          }),
        }),
      )
    })
  })

  describe('disableNutrizReminder e o consentimento guarda-chuva', () => {
    it('retorna NOT_FOUND quando não havia preferência para desligar', async () => {
      mocks.preferenceUpdateMany.mockResolvedValue({ count: 0 })

      await expect(
        disableNutrizReminder({
          nutrizProfileId: PROFILE_ID,
          type: 'MILK_VALIDITY',
        }),
      ).resolves.toEqual({ status: 'NOT_FOUND' })
      expect(mocks.setReminderConsent).not.toHaveBeenCalled()
    })

    it('retira o consentimento guarda-chuva quando nenhuma preferência continua ativa', async () => {
      mocks.preferenceUpdateMany.mockResolvedValue({ count: 1 })
      mocks.preferenceCount.mockResolvedValue(0)

      await disableNutrizReminder({
        nutrizProfileId: PROFILE_ID,
        type: 'FUTURE_DONATION',
      })

      expect(mocks.setReminderConsent).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false }),
      )
    })

    it('mantém o consentimento guarda-chuva quando outra preferência ainda está ativa', async () => {
      mocks.preferenceUpdateMany.mockResolvedValue({ count: 1 })
      mocks.preferenceCount.mockResolvedValue(1)

      await disableNutrizReminder({
        nutrizProfileId: PROFILE_ID,
        type: 'FUTURE_DONATION',
      })

      expect(mocks.setReminderConsent).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true }),
      )
    })
  })
})
