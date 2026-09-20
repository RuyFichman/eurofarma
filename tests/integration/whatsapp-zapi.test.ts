import { afterEach, describe, expect, it, vi } from 'vitest'

import { prisma } from '../../lib/db/prisma'
import { recordZapiDeliveryStatusEvent } from '../../lib/db/queries/notification-delivery-status-events'
import { processInboundWhatsappMessage } from '../../lib/whatsapp/process-inbound'
import type { WhatsAppProvider } from '../../lib/whatsapp/provider'
import { extractZapiDeliveryStatusEvents } from '../../lib/whatsapp/zapi-status-payload'
import { createTestNutrizProfile } from '../helpers/factories'

const testPrefix = `__test__zapi-${Date.now()}-${Math.random()
  .toString(16)
  .slice(2)}`

function testPhone(suffix: string): string {
  return `551197${suffix.padStart(7, '0')}`
}

function provider(
  sendSessionMessage: WhatsAppProvider['sendSessionMessage'],
): WhatsAppProvider {
  return {
    sendSessionMessage,
    sendTemplate: vi.fn().mockResolvedValue({
      outcome: 'NOT_CONFIGURED',
      errorCode: 'ZAPI_TEMPLATE_NOT_CONFIGURED',
    }),
  }
}

afterEach(async () => {
  await prisma.whatsappInboundMessage.deleteMany({
    where: {
      provider: 'ZAPI',
      providerMessageId: { startsWith: testPrefix },
    },
  })
})

describe('Z-API no fluxo persistido', () => {
  it('processa somente uma vez a mesma messageId e mantém o resultado técnico', async () => {
    const phone = testPhone('1')
    const messageId = `${testPrefix}-duplicate`
    await createTestNutrizProfile({ phoneWhatsapp: phone })
    const sendSessionMessage = vi.fn().mockResolvedValue({
      outcome: 'SENT' as const,
      providerMessageId: `${testPrefix}-outbound`,
    })
    const zapi = provider(sendSessionMessage)
    const params = {
      message: { from: phone, messageId, text: 'menu', replyId: null },
      provider: zapi,
      inboundProvider: 'ZAPI' as const,
      siteUrl: 'https://nutrilink.test',
    }

    await processInboundWhatsappMessage(params)
    await processInboundWhatsappMessage(params)

    expect(sendSessionMessage).toHaveBeenCalledTimes(1)
    await expect(
      prisma.whatsappInboundMessage.findUniqueOrThrow({
        where: {
          provider_providerMessageId: {
            provider: 'ZAPI',
            providerMessageId: messageId,
          },
        },
        select: {
          processingResult: true,
          replyDeliveryOutcome: true,
          replyProviderMessageId: true,
          replyErrorCode: true,
        },
      }),
    ).resolves.toEqual({
      processingResult: 'PROCESSED',
      replyDeliveryOutcome: 'SENT',
      replyProviderMessageId: `${testPrefix}-outbound`,
      replyErrorCode: null,
    })
  })

  it('persiste falha de envio como FAILED e não a confunde com entrada processada', async () => {
    const phone = testPhone('2')
    const messageId = `${testPrefix}-failure`
    await createTestNutrizProfile({ phoneWhatsapp: phone })

    await processInboundWhatsappMessage({
      message: { from: phone, messageId, text: 'menu', replyId: null },
      provider: provider(
        vi.fn().mockResolvedValue({
          outcome: 'RETRYABLE_FAILURE',
          errorCode: 'ZAPI_HTTP_503',
        }),
      ),
      inboundProvider: 'ZAPI',
      siteUrl: 'https://nutrilink.test',
    })

    await expect(
      prisma.whatsappInboundMessage.findUniqueOrThrow({
        where: {
          provider_providerMessageId: {
            provider: 'ZAPI',
            providerMessageId: messageId,
          },
        },
        select: {
          processingResult: true,
          replyDeliveryOutcome: true,
          replyProviderMessageId: true,
          replyErrorCode: true,
        },
      }),
    ).resolves.toEqual({
      processingResult: 'FAILED',
      replyDeliveryOutcome: 'RETRYABLE_FAILURE',
      replyProviderMessageId: null,
      replyErrorCode: 'ZAPI_HTTP_503',
    })
  })

  it('aceita uma opção numérica da última lista textual enviada pela Z-API', async () => {
    const phone = testPhone('3')
    await createTestNutrizProfile({ phoneWhatsapp: phone })
    const sendSessionMessage = vi.fn().mockResolvedValue({
      outcome: 'SENT' as const,
      providerMessageId: `${testPrefix}-numeric-outbound`,
    })
    const zapi = provider(sendSessionMessage)

    await processInboundWhatsappMessage({
      message: {
        from: phone,
        messageId: `${testPrefix}-numeric-menu`,
        text: 'oi',
        replyId: null,
      },
      provider: zapi,
      inboundProvider: 'ZAPI',
      siteUrl: 'https://nutrilink.test',
    })
    await processInboundWhatsappMessage({
      message: {
        from: phone,
        messageId: `${testPrefix}-numeric-choice`,
        text: '2',
        replyId: null,
      },
      provider: zapi,
      inboundProvider: 'ZAPI',
      siteUrl: 'https://nutrilink.test',
    })

    expect(sendSessionMessage).toHaveBeenCalledTimes(2)
    expect(sendSessionMessage.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        reply: expect.objectContaining({ type: 'text' }),
      }),
    )
    await expect(
      prisma.whatsappConversation.findUniqueOrThrow({
        where: { phoneWhatsapp: phone },
        select: { step: true, context: true },
      }),
    ).resolves.toMatchObject({
      step: 'AWAITING_COVERAGE',
      context: {},
    })
  })

  it('mantém o callback de status como auditoria append-only, sem vínculo à outbox', async () => {
    const providerMessageId = `${testPrefix}-status`
    const [statusEvent] = extractZapiDeliveryStatusEvents(
      {
        type: 'MessageStatusCallback',
        instanceId: 'zapi-instance',
        status: 'READ',
        ids: [providerMessageId],
        isGroup: false,
      },
      'zapi-instance',
    )
    expect(statusEvent).toBeDefined()
    const rollback = new Error('ROLLBACK_ZAPI_STATUS_TEST')

    await expect(
      prisma.$transaction(async (transaction) => {
        await recordZapiDeliveryStatusEvent(statusEvent!, transaction)
        await expect(
          transaction.notificationDeliveryStatusEvent.findMany({
            where: { provider: 'ZAPI', providerMessageId },
            select: {
              provider: true,
              status: true,
              outboxId: true,
              errorCode: true,
            },
          }),
        ).resolves.toEqual([
          { provider: 'ZAPI', status: 'READ', outboxId: null, errorCode: null },
        ])
        throw rollback
      }),
    ).rejects.toBe(rollback)
  })
})
