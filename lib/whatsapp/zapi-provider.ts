import type { BotReply } from './conversation'
import type {
  SendResult,
  SessionMessage,
  TemplateMessage,
  WhatsAppProvider,
} from './provider'

type ZapiConfig = {
  instanceId: string
  instanceToken: string
  clientToken: string | null
}

type ZapiResponse = {
  messageId?: unknown
  id?: unknown
}

function endpoint(config: ZapiConfig, operation: string): string {
  return `https://api.z-api.io/instances/${encodeURIComponent(
    config.instanceId,
  )}/token/${encodeURIComponent(config.instanceToken)}/${operation}`
}

function classifyFailure(status: number): SendResult {
  const errorCode = `ZAPI_HTTP_${status}`
  return status === 408 || status === 429 || status >= 500
    ? { outcome: 'RETRYABLE_FAILURE', errorCode }
    : { outcome: 'PERMANENT_FAILURE', errorCode }
}

function requestForReply(reply: BotReply): {
  operation: 'send-text' | 'send-button-list' | 'send-option-list'
  body: Record<string, unknown>
} {
  if (reply.type === 'text') {
    return { operation: 'send-text', body: { message: reply.body } }
  }

  if (reply.type === 'buttons') {
    return {
      operation: 'send-button-list',
      body: {
        message: reply.body,
        buttonList: {
          buttons: reply.buttons.map((button) => ({
            id: button.id,
            label: button.title,
          })),
        },
      },
    }
  }

  return {
    operation: 'send-option-list',
    body: {
      message: reply.body,
      optionList: {
        title: reply.button,
        buttonLabel: reply.button,
        options: reply.rows.map((row) => ({ id: row.id, title: row.title })),
      },
    },
  }
}

export class ZapiWhatsAppProvider implements WhatsAppProvider {
  constructor(
    private readonly config: ZapiConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async sendSessionMessage(input: SessionMessage): Promise<SendResult> {
    const request = requestForReply(input.reply)
    try {
      const response = await this.fetchImpl(
        endpoint(this.config, request.operation),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.clientToken
              ? { 'Client-Token': this.config.clientToken }
              : {}),
          },
          body: JSON.stringify({ phone: input.to, ...request.body }),
        },
      )

      if (!response.ok) return classifyFailure(response.status)

      const payload = (await response.json()) as ZapiResponse
      const providerMessageId =
        typeof payload.messageId === 'string'
          ? payload.messageId.trim()
          : typeof payload.id === 'string'
            ? payload.id.trim()
            : ''
      return providerMessageId
        ? { outcome: 'SENT', providerMessageId }
        : { outcome: 'RETRYABLE_FAILURE', errorCode: 'ZAPI_MESSAGE_ID_MISSING' }
    } catch {
      return {
        outcome: 'RETRYABLE_FAILURE',
        errorCode: 'ZAPI_TRANSPORT_EXCEPTION',
      }
    }
  }

  sendTemplate(_input: TemplateMessage): Promise<SendResult> {
    return Promise.resolve({
      outcome: 'NOT_CONFIGURED',
      errorCode: 'ZAPI_TEMPLATE_NOT_CONFIGURED',
    })
  }
}

export function getZapiWhatsAppProvider(): WhatsAppProvider | null {
  const instanceId = process.env.ZAPI_INSTANCE_ID?.trim()
  const instanceToken = process.env.ZAPI_INSTANCE_TOKEN?.trim()
  if (!instanceId || !instanceToken) return null

  return new ZapiWhatsAppProvider({
    instanceId,
    instanceToken,
    clientToken: process.env.ZAPI_CLIENT_TOKEN?.trim() || null,
  })
}
