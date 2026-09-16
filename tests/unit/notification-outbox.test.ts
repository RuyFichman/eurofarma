import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  claim: vi.fn(),
  finalize: vi.fn(),
}))

vi.mock('../../lib/db/queries/notification-outbox', () => ({
  claimNextNotificationOutbox: mocks.claim,
  finalizeNotificationOutbox: mocks.finalize,
}))

import {
  buildJourneyStatusNotificationBody,
  getNotificationRetryAt,
  type NotificationTransport,
} from '../../lib/notifications/journey-status-notification'
import { processNotificationOutbox } from '../../lib/notifications/process-outbox'

const NOW = new Date('2026-09-16T15:00:00.000Z')
const claim = {
  id: 'outbox-1',
  lockToken: 'lock-1',
  idempotencyKey: 'journey-status:history-1',
  kind: 'JOURNEY_STATUS_CHANGED' as const,
  attemptNumber: 1,
  maxAttempts: 5,
  toStatus: 'FORM_RECEIVED' as const,
  payload: null,
  phoneWhatsapp: '5511999998888',
  profileDeleted: false,
  hasCurrentConsent: true,
}

function transport(
  result: Awaited<ReturnType<NotificationTransport['send']>>,
): NotificationTransport {
  return { send: vi.fn().mockResolvedValue(result) }
}

describe('mensagem do RF17', () => {
  it('mostra somente a categoria e não promete agendamento ou coleta', () => {
    const body = buildJourneyStatusNotificationBody(
      'EXAMS_COMPLETED',
      'https://nutrilink.test/',
    )

    expect(body).toContain('Exames feitos')
    expect(body).toContain('https://nutrilink.test/meu-agendamento')
    expect(body).toContain('não representa agendamento')
    expect(body).not.toMatch(/laudo|resultado positivo|resultado negativo/iu)
  })

  it('aplica backoff crescente e limitado', () => {
    expect(getNotificationRetryAt(1, NOW).getTime() - NOW.getTime()).toBe(
      60_000,
    )
    expect(getNotificationRetryAt(2, NOW).getTime() - NOW.getTime()).toBe(
      5 * 60_000,
    )
    expect(getNotificationRetryAt(99, NOW).getTime() - NOW.getTime()).toBe(
      2 * 60 * 60_000,
    )
  })
})

describe('processador da outbox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.claim.mockResolvedValueOnce(claim).mockResolvedValueOnce(null)
    mocks.finalize.mockResolvedValue(undefined)
  })

  it('registra envio concluído com o identificador do provedor', async () => {
    const summary = await processNotificationOutbox({
      transport: transport({ outcome: 'SENT', providerMessageId: 'sim.1' }),
      siteUrl: 'https://nutrilink.test',
      now: () => NOW,
    })

    expect(summary).toEqual({
      claimed: 1,
      sent: 1,
      retried: 0,
      failed: 0,
      suppressed: 0,
    })
    expect(mocks.finalize).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'SENT',
        outcome: 'SENT',
        providerMessageId: 'sim.1',
      }),
    )
  })

  it('agenda nova tentativa depois de falha temporária', async () => {
    await processNotificationOutbox({
      transport: transport({
        outcome: 'RETRYABLE_FAILURE',
        errorCode: 'meta unavailable',
      }),
      siteUrl: 'https://nutrilink.test',
      now: () => NOW,
    })

    expect(mocks.finalize).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'RETRY_SCHEDULED',
        outcome: 'RETRY_SCHEDULED',
        errorCode: 'META_UNAVAILABLE',
        availableAt: new Date(NOW.getTime() + 60_000),
      }),
    )
  })

  it('encerra depois da última tentativa', async () => {
    mocks.claim.mockReset()
    mocks.claim
      .mockResolvedValueOnce({ ...claim, attemptNumber: 5 })
      .mockResolvedValueOnce(null)

    await processNotificationOutbox({
      transport: transport({
        outcome: 'RETRYABLE_FAILURE',
        errorCode: 'TEMPORARY_FAILURE',
      }),
      siteUrl: 'https://nutrilink.test',
      now: () => NOW,
    })

    expect(mocks.finalize).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'FAILED', outcome: 'FAILED' }),
    )
  })

  it('suprime antes do transporte quando o consentimento foi retirado', async () => {
    mocks.claim.mockReset()
    mocks.claim
      .mockResolvedValueOnce({ ...claim, hasCurrentConsent: false })
      .mockResolvedValueOnce(null)
    const fakeTransport = transport({
      outcome: 'SENT',
      providerMessageId: 'nao-deveria-enviar',
    })

    await processNotificationOutbox({
      transport: fakeTransport,
      siteUrl: 'https://nutrilink.test',
      now: () => NOW,
    })

    expect(fakeTransport.send).not.toHaveBeenCalled()
    expect(mocks.finalize).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'SUPPRESSED',
        outcome: 'SUPPRESSED',
        errorCode: 'CONSENT_NOT_GRANTED',
      }),
    )
  })

  it('processa lembrete sem exigir status de jornada no payload', async () => {
    mocks.claim.mockReset()
    mocks.claim
      .mockResolvedValueOnce({
        ...claim,
        kind: 'REMINDER',
        toStatus: null,
        payload: {
          reminderKind: 'KIT_DELIVERY_FOLLOW_UP',
          sourceHistoryId: 'history-1',
          referenceAt: '2026-09-14T15:00:00.000Z',
        },
      })
      .mockResolvedValueOnce(null)
    const fakeTransport = transport({
      outcome: 'SENT',
      providerMessageId: 'reminder-1',
    })

    await expect(
      processNotificationOutbox({
        transport: fakeTransport,
        siteUrl: 'https://nutrilink.test/',
        now: () => NOW,
      }),
    ).resolves.toMatchObject({ claimed: 1, sent: 1 })

    expect(fakeTransport.send).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: 'journey-status:history-1',
        body: expect.stringContaining('não agenda nem confirma'),
      }),
    )
  })

  it('falha item de lembrete com payload inválido sem transportar', async () => {
    mocks.claim.mockReset()
    mocks.claim
      .mockResolvedValueOnce({ ...claim, kind: 'REMINDER', toStatus: null })
      .mockResolvedValueOnce(null)
    const fakeTransport = transport({
      outcome: 'SENT',
      providerMessageId: 'nao-deveria-enviar',
    })

    await processNotificationOutbox({
      transport: fakeTransport,
      siteUrl: 'https://nutrilink.test',
      now: () => NOW,
    })

    expect(fakeTransport.send).not.toHaveBeenCalled()
    expect(mocks.finalize).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILED',
        errorCode: 'INVALID_REMINDER_PAYLOAD',
      }),
    )
  })
})
