import type {
  NotificationTransport,
  NotificationTransportInput,
  NotificationTransportResult,
} from './journey-status-notification'
import type { WhatsAppProvider } from '../whatsapp/provider'

function mapProviderResult(
  result: Awaited<ReturnType<WhatsAppProvider['sendSessionMessage']>>,
): NotificationTransportResult {
  if (result.outcome === 'SENT') return result
  if (result.outcome === 'PERMANENT_FAILURE') return result
  return {
    outcome: 'RETRYABLE_FAILURE',
    errorCode: result.errorCode,
  }
}

/**
 * Adaptador da outbox para a Programmable Messaging API do Twilio. O provedor
 * decide a chamada HTTP e retorna o MessageSid; este adaptador apenas escolhe
 * mensagem livre ou ContentSid conforme a janela já calculada pela outbox.
 */
export function createTwilioNotificationTransport(
  provider: WhatsAppProvider | null,
  statusCallbackUrl: string | null,
): NotificationTransport {
  return {
    async send(
      input: NotificationTransportInput,
    ): Promise<NotificationTransportResult> {
      if (!provider) {
        return {
          outcome: 'RETRYABLE_FAILURE',
          errorCode: 'TWILIO_NOT_CONFIGURED',
        }
      }

      if (input.delivery === 'FREEFORM') {
        return mapProviderResult(
          await provider.sendSessionMessage({
            to: input.to,
            reply: { type: 'text', body: input.body },
            ...(statusCallbackUrl ? { statusCallbackUrl } : {}),
          }),
        )
      }

      if (!input.template || !input.templateVariables) {
        return {
          outcome: 'PERMANENT_FAILURE',
          errorCode: 'TWILIO_TEMPLATE_INPUT_INVALID',
        }
      }

      return mapProviderResult(
        await provider.sendTemplate({
          to: input.to,
          template: input.template,
          variables: input.templateVariables,
          ...(statusCallbackUrl ? { statusCallbackUrl } : {}),
        }),
      )
    },
  }
}
