import type { BotReply } from './conversation'

/**
 * Cliente mínimo da Cloud API do WhatsApp — só o que o bot precisa: mandar
 * texto, botões e lista. Sem SDK: são duas chamadas HTTP, e uma dependência a
 * mais só para montar JSON não se paga.
 *
 * As variáveis não têm prefixo `NEXT_PUBLIC_` — o token de acesso dá poder de
 * enviar mensagem em nome do número, e não pode chegar ao navegador.
 */

/** Limites da Meta. Título de botão vai até 20 caracteres; de item de lista, 24. */
const BUTTON_TITLE_MAX = 20
const ROW_TITLE_MAX = 24

const DEFAULT_API_VERSION = 'v21.0'

export type WhatsappEnv = {
  accessToken: string
  phoneNumberId: string
  apiVersion: string
}

/**
 * Devolve `null` em vez de lançar quando o envio não está configurado. O
 * webhook precisa continuar gravando o que a nutriz contou mesmo sem conseguir
 * responder — perder o dado seria pior que ficar mudo, e em desenvolvimento
 * (antes do app na Meta existir) esse é o caminho normal.
 */
export function getWhatsappSendEnv(): WhatsappEnv | null {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim()
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  if (!accessToken || !phoneNumberId) return null

  return {
    accessToken,
    phoneNumberId,
    apiVersion: process.env.WHATSAPP_API_VERSION?.trim() || DEFAULT_API_VERSION,
  }
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max)
}

/** Traduz a resposta do fluxo para o corpo que a Cloud API espera. */
export function buildSendPayload(
  to: string,
  reply: BotReply,
): Record<string, unknown> {
  const base = { messaging_product: 'whatsapp', to }

  if (reply.type === 'text') {
    return { ...base, type: 'text', text: { body: reply.body } }
  }

  if (reply.type === 'buttons') {
    return {
      ...base,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: reply.body },
        action: {
          buttons: reply.buttons.map((button) => ({
            type: 'reply',
            reply: {
              id: button.id,
              title: truncate(button.title, BUTTON_TITLE_MAX),
            },
          })),
        },
      },
    }
  }

  return {
    ...base,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: reply.body },
      action: {
        button: truncate(reply.button, BUTTON_TITLE_MAX),
        sections: [
          {
            rows: reply.rows.map((row) => ({
              id: row.id,
              title: truncate(row.title, ROW_TITLE_MAX),
            })),
          },
        ],
      },
    },
  }
}

/**
 * Envia a resposta. Nunca lança: falha de envio é registrada e engolida, porque
 * o webhook precisa responder 200 à Meta de qualquer jeito — um erro aqui faria
 * a Meta reenviar o mesmo evento, e o bot responderia em duplicata.
 */
export async function sendWhatsappReply(params: {
  to: string
  reply: BotReply
}): Promise<boolean> {
  const env = getWhatsappSendEnv()
  if (!env) return false

  const url = `https://graph.facebook.com/${env.apiVersion}/${env.phoneNumberId}/messages`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildSendPayload(params.to, params.reply)),
    })

    if (!response.ok && process.env.NODE_ENV === 'development') {
      // Só status — o corpo do erro da Meta ecoa a mensagem enviada.
      console.error('[whatsapp] envio falhou', response.status)
    }

    return response.ok
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[whatsapp] envio falhou', error)
    }
    return false
  }
}
