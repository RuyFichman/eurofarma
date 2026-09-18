import type { BotReply } from './conversation'

export type SessionMessage = {
  to: string
  reply: BotReply
  statusCallbackUrl?: string
}

export type WhatsAppTemplateName =
  | 'journey-status-changed'
  | 'kit-delivery-follow-up'

export type TemplateMessage = {
  to: string
  /** Nome lógico do template; identificadores do provedor não entram no domínio. */
  template: WhatsAppTemplateName
  variables: Readonly<Record<string, string>>
  statusCallbackUrl?: string
}

export type SendResult =
  | { outcome: 'SENT'; providerMessageId: string }
  | { outcome: 'NOT_CONFIGURED'; errorCode: string }
  | { outcome: 'RETRYABLE_FAILURE'; errorCode: string }
  | { outcome: 'PERMANENT_FAILURE'; errorCode: string }

export interface WhatsAppProvider {
  sendSessionMessage(input: SessionMessage): Promise<SendResult>
  sendTemplate(input: TemplateMessage): Promise<SendResult>
}

export async function sendWhatsappReply(params: {
  provider: WhatsAppProvider | null
  to: string
  reply: BotReply
  statusCallbackUrl?: string
}): Promise<boolean> {
  if (!params.provider) return false
  return wasMessageSent(
    await params.provider.sendSessionMessage({
      to: params.to,
      reply: params.reply,
    }),
  )
}

export function wasMessageSent(result: SendResult): boolean {
  return result.outcome === 'SENT'
}
