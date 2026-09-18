import { buildSendPayload, getWhatsappSendEnv } from './client'
import type {
  SendResult,
  SessionMessage,
  TemplateMessage,
  WhatsAppProvider,
} from './provider'

export class MetaWhatsAppProvider implements WhatsAppProvider {
  constructor(
    private readonly env: NonNullable<ReturnType<typeof getWhatsappSendEnv>>,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async sendSessionMessage(input: SessionMessage): Promise<SendResult> {
    const url = `https://graph.facebook.com/${this.env.apiVersion}/${this.env.phoneNumberId}/messages`

    try {
      const response = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.env.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildSendPayload(input.to, input.reply)),
      })

      if (!response.ok) {
        const errorCode = `META_HTTP_${response.status}`
        return response.status === 408 ||
          response.status === 429 ||
          response.status >= 500
          ? { outcome: 'RETRYABLE_FAILURE', errorCode }
          : { outcome: 'PERMANENT_FAILURE', errorCode }
      }

      const payload = (await response.json()) as {
        messages?: Array<{ id?: unknown }>
      }
      const providerMessageId = payload.messages?.[0]?.id
      return typeof providerMessageId === 'string' && providerMessageId.trim()
        ? { outcome: 'SENT', providerMessageId: providerMessageId.trim() }
        : {
            outcome: 'RETRYABLE_FAILURE',
            errorCode: 'META_MESSAGE_ID_MISSING',
          }
    } catch {
      return {
        outcome: 'RETRYABLE_FAILURE',
        errorCode: 'META_TRANSPORT_EXCEPTION',
      }
    }
  }

  sendTemplate(_input: TemplateMessage): Promise<SendResult> {
    return Promise.resolve({
      outcome: 'NOT_CONFIGURED',
      errorCode: 'META_TEMPLATE_NOT_CONFIGURED',
    })
  }
}

export function getMetaWhatsAppProvider(): WhatsAppProvider | null {
  const env = getWhatsappSendEnv()
  return env ? new MetaWhatsAppProvider(env) : null
}
