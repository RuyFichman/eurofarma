import { NextResponse, type NextRequest } from 'next/server'

import { isValidWhatsappSignature } from '@/lib/whatsapp/signature'
import { extractInboundMessage } from '@/lib/whatsapp/payload'
import { advanceConversation, type BotReply } from '@/lib/whatsapp/conversation'
import { sendWhatsappReply } from '@/lib/whatsapp/client'
import {
  createDeclaredAppointment,
  createNotScheduledAppointment,
  findNutrizByWhatsapp,
  getConversationState,
  saveConversationState,
} from '@/lib/db/queries/whatsapp-conversations'
import { WHATSAPP_BOT } from '@/lib/i18n/pt-br'

// Prisma não roda no Edge.
export const runtime = 'nodejs'

/** Base pública do site, para os links que o bot manda. */
function getSiteUrl(request: NextRequest): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (explicit) return explicit
  return request.nextUrl.origin
}

/**
 * `GET /api/whatsapp/webhook` — aperto de mão de verificação da Meta.
 *
 * Ela chama uma vez, no cadastro do webhook, e espera de volta o `hub.challenge`
 * **em texto puro**. Devolver JSON aqui faz a verificação falhar sem explicação
 * no painel da Meta.
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim()

  if (!expected || mode !== 'subscribe' || token !== expected || !challenge) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return new NextResponse(challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
  })
}

/** Injeta os links nos textos finais, que vêm do i18n com placeholder. */
function withLinks(reply: BotReply, siteUrl: string): BotReply {
  if (reply.type !== 'text') return reply

  if (reply.body === WHATSAPP_BOT.scheduledSaved.bodyTemplate) {
    return {
      type: 'text',
      body: reply.body.replace('{url}', `${siteUrl}/meu-agendamento`),
    }
  }
  if (reply.body === WHATSAPP_BOT.notScheduledSaved.bodyTemplate) {
    return {
      type: 'text',
      body: reply.body.replace('{url}', `${siteUrl}/buscar`),
    }
  }
  return reply
}

/**
 * `POST /api/whatsapp/webhook` — mensagens recebidas do chatbot (Sprint 6.5).
 *
 * O fluxo é: **assinatura → identificar a nutriz pelo número → avançar a
 * conversa → gravar → responder**. A decisão de qual resposta dar é toda de
 * `advanceConversation`, que é pura; aqui só há efeito colateral.
 *
 * **Sempre responde 200** depois da assinatura conferida, mesmo em erro
 * interno. A Meta reenvia o evento quando não recebe 2xx, e um reenvio faria o
 * bot responder em duplicata. Assinatura inválida é a única exceção — aí o 401
 * é o ponto.
 *
 * Idempotência: um reenvio chega com a conversa já em `FINISHED`, e o estado
 * `FINISHED` não grava nada — só recomeça a pergunta. Isso cobre o caso comum
 * (resposta lenta). Resta uma janela pequena entre gravar o agendamento e
 * gravar o passo; nela, um reenvio duplicaria o registro. Fechá-la exigiria
 * guardar o `messageId` já processado, o que é coluna nova — vale fazer se
 * aparecer duplicata na prática.
 */
export async function POST(request: NextRequest) {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim()
  const rawBody = await request.text()

  // Sem segredo configurado o endpoint não tem como se defender: recusa tudo,
  // em vez de aceitar qualquer corpo enquanto ninguém configurou o ambiente.
  if (
    !appSecret ||
    !isValidWhatsappSignature({
      rawBody,
      signatureHeader: request.headers.get('x-hub-signature-256'),
      appSecret,
    })
  ) {
    return NextResponse.json(
      { error: { code: 'INVALID_SIGNATURE' } },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const ok = NextResponse.json(
    { ok: true },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )

  try {
    let payload: unknown
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return ok
    }

    // Recibos de entrega e leitura chegam neste mesmo webhook, sem `messages`.
    const message = extractInboundMessage(payload)
    if (!message) return ok

    const siteUrl = getSiteUrl(request)
    const nutriz = await findNutrizByWhatsapp(message.from)

    // Número sem cadastro: convida e não guarda conversa. A mensagem não
    // confirma nem nega a existência de conta de ninguém.
    if (!nutriz) {
      await sendWhatsappReply({
        to: message.from,
        reply: {
          type: 'text',
          body: WHATSAPP_BOT.unknownNumber.bodyTemplate.replace(
            '{url}',
            `${siteUrl}/cadastro`,
          ),
        },
      })
      return ok
    }

    const state = await getConversationState(message.from)
    const outcome = advanceConversation({
      step: state.step,
      draftScheduledAt: state.draftScheduledAt,
      text: message.text,
      replyId: message.replyId,
    })

    if (outcome.effect.kind === 'save_scheduled') {
      await createDeclaredAppointment({
        nutrizProfileId: nutriz.id,
        scheduledAt: outcome.effect.scheduledAt,
      })
    } else if (outcome.effect.kind === 'save_not_scheduled') {
      await createNotScheduledAppointment({
        nutrizProfileId: nutriz.id,
        reason: outcome.effect.reason,
      })
    }

    await saveConversationState({
      phoneWhatsapp: message.from,
      nutrizProfileId: nutriz.id,
      step: outcome.nextStep,
      draftScheduledAt: outcome.draftScheduledAt,
    })

    await sendWhatsappReply({
      to: message.from,
      reply: withLinks(outcome.reply, siteUrl),
    })

    return ok
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // Só o erro técnico — nunca o corpo, que carrega o número e o texto dela.
      console.error('[POST /api/whatsapp/webhook]', error)
    }
    return ok
  }
}
