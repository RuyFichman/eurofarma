import type { BotReply } from './conversation'
import type {
  SendResult,
  SessionMessage,
  TemplateMessage,
  WhatsAppProvider,
  WhatsAppTemplateName,
} from './provider'

export type TwilioTemplateConfig = {
  contentSid: string
  /** Ordem das variáveis no template aprovado pelo WhatsApp. */
  variableNames: readonly string[]
}

export type TwilioWhatsAppConfig = {
  accountSid: string
  authToken: string
  from: string
  messagingServiceSid?: string
  templates?: Readonly<
    Partial<Record<WhatsAppTemplateName, TwilioTemplateConfig>>
  >
}

type Fetch = typeof fetch

type TwilioMessageResponse = {
  sid?: unknown
}

export function buildTwilioBody(reply: BotReply): string {
  if (reply.type === 'text') return reply.body

  const choices = reply.type === 'buttons' ? reply.buttons : reply.rows
  return `${reply.body}\n\n${choices
    .map((choice) => `• ${choice.title}`)
    .join('\n')}\n\nResponda escrevendo uma das opções acima.`
}

export function normalizeTwilioAddress(value: string): string {
  const normalized = value.replace(/^whatsapp:/u, '').trim()
  const phone = normalized.startsWith('+')
    ? normalized
    : `+${normalized.replace(/\D/gu, '')}`
  return `whatsapp:${phone}`
}

function classifyFailure(status: number): SendResult {
  const errorCode = `TWILIO_HTTP_${status}`
  return status === 408 || status === 429 || status >= 500
    ? { outcome: 'RETRYABLE_FAILURE', errorCode }
    : { outcome: 'PERMANENT_FAILURE', errorCode }
}

function templateVariables(
  input: TemplateMessage,
  config: TwilioTemplateConfig,
): Record<string, string> | null {
  const result: Record<string, string> = {}

  for (const [index, name] of config.variableNames.entries()) {
    const value = input.variables[name]
    if (value === undefined) return null
    result[String(index + 1)] = value
  }

  return result
}

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  constructor(
    private readonly config: TwilioWhatsAppConfig,
    private readonly fetchImpl: Fetch = fetch,
  ) {}

  sendSessionMessage(input: SessionMessage): Promise<SendResult> {
    return this.send(
      new URLSearchParams({
        From: normalizeTwilioAddress(this.config.from),
        To: normalizeTwilioAddress(input.to),
        Body: buildTwilioBody(input.reply),
        ...(input.statusCallbackUrl
          ? { StatusCallback: input.statusCallbackUrl }
          : {}),
      }),
    )
  }

  sendTemplate(input: TemplateMessage): Promise<SendResult> {
    const template = this.config.templates?.[input.template]
    if (!template || !this.config.messagingServiceSid) {
      return Promise.resolve({
        outcome: 'NOT_CONFIGURED',
        errorCode: 'TWILIO_TEMPLATE_NOT_CONFIGURED',
      })
    }

    const variables = templateVariables(input, template)
    if (!variables) {
      return Promise.resolve({
        outcome: 'PERMANENT_FAILURE',
        errorCode: 'TWILIO_TEMPLATE_VARIABLE_MISSING',
      })
    }

    return this.send(
      new URLSearchParams({
        From: normalizeTwilioAddress(this.config.from),
        To: normalizeTwilioAddress(input.to),
        MessagingServiceSid: this.config.messagingServiceSid,
        ContentSid: template.contentSid,
        ContentVariables: JSON.stringify(variables),
        ...(input.statusCallbackUrl
          ? { StatusCallback: input.statusCallbackUrl }
          : {}),
      }),
    )
  }

  private async send(body: URLSearchParams): Promise<SendResult> {
    try {
      const response = await this.fetchImpl(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${this.config.accountSid}:${this.config.authToken}`,
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        },
      )

      if (!response.ok) return classifyFailure(response.status)

      const payload = (await response.json()) as TwilioMessageResponse
      if (typeof payload.sid !== 'string' || !payload.sid.trim()) {
        return {
          outcome: 'RETRYABLE_FAILURE',
          errorCode: 'TWILIO_MESSAGE_ID_MISSING',
        }
      }

      return { outcome: 'SENT', providerMessageId: payload.sid.trim() }
    } catch {
      return {
        outcome: 'RETRYABLE_FAILURE',
        errorCode: 'TWILIO_TRANSPORT_EXCEPTION',
      }
    }
  }
}

export function getTwilioStatusCallbackUrl(): string | null {
  const value = process.env.TWILIO_STATUS_CALLBACK_URL?.trim()
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null
  } catch {
    return null
  }
}

export function getTwilioWhatsAppProvider(): WhatsAppProvider | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim()
  if (!accountSid || !authToken || !from) return null

  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim()
  const statusContentSid =
    process.env.TWILIO_STATUS_TEMPLATE_CONTENT_SID?.trim()
  const reminderContentSid =
    process.env.TWILIO_REMINDER_TEMPLATE_CONTENT_SID?.trim()

  const templates: Partial<Record<WhatsAppTemplateName, TwilioTemplateConfig>> =
    {}
  if (statusContentSid) {
    templates['journey-status-changed'] = {
      contentSid: statusContentSid,
      variableNames: ['status', 'areaUrl'],
    }
  }
  if (reminderContentSid) {
    templates['kit-delivery-follow-up'] = {
      contentSid: reminderContentSid,
      variableNames: ['areaUrl'],
    }
  }

  return new TwilioWhatsAppProvider({
    accountSid,
    authToken,
    from,
    messagingServiceSid,
    templates,
  })
}
