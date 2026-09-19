import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findOutbox: vi.fn(),
  createEvent: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    notificationOutbox: { findFirst: mocks.findOutbox },
    notificationDeliveryStatusEvent: { create: mocks.createEvent },
  },
}))

import {
  recordTwilioDeliveryStatusEvent,
  recordZapiDeliveryStatusEvent,
} from '../../lib/db/queries/notification-delivery-status-events'

describe('auditoria de callback Twilio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createEvent.mockResolvedValue({ id: 'event-1' })
  })

  it('vincula o MessageSid à outbox sem registrar telefone ou conteúdo', async () => {
    mocks.findOutbox.mockResolvedValue({ id: 'outbox-1' })

    await recordTwilioDeliveryStatusEvent({
      providerMessageId: 'SM-delivered-1',
      status: 'DELIVERED',
      errorCode: null,
    })

    expect(mocks.findOutbox).toHaveBeenCalledWith({
      where: { providerMessageId: 'SM-delivered-1' },
      select: { id: true },
    })
    expect(mocks.createEvent).toHaveBeenCalledWith({
      data: {
        outboxId: 'outbox-1',
        provider: 'TWILIO',
        providerMessageId: 'SM-delivered-1',
        status: 'DELIVERED',
        errorCode: null,
      },
    })
  })

  it('retém callback válido sem vínculo e normaliza o código de erro', async () => {
    mocks.findOutbox.mockResolvedValue(null)

    await recordTwilioDeliveryStatusEvent({
      providerMessageId: 'SM-failed-1',
      status: 'FAILED',
      errorCode: '  63016 / template unavailable  ',
    })

    expect(mocks.createEvent).toHaveBeenCalledWith({
      data: expect.objectContaining({
        outboxId: undefined,
        errorCode: '63016___TEMPLATE_UNAVAILABLE',
      }),
    })
  })

  it('registra callback da Z-API sem telefone, corpo ou vínculo obrigatório', async () => {
    mocks.findOutbox.mockResolvedValue(null)

    await recordZapiDeliveryStatusEvent({
      providerMessageId: 'zapi-read-1',
      status: 'READ',
      errorCode: null,
    })

    expect(mocks.createEvent).toHaveBeenCalledWith({
      data: {
        outboxId: undefined,
        provider: 'ZAPI',
        providerMessageId: 'zapi-read-1',
        status: 'READ',
        errorCode: null,
      },
    })
  })
})
