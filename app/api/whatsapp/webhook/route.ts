import { NextResponse, type NextRequest } from 'next/server'

import {
  createWhatsappNutrizLead,
  findNutrizByWhatsapp,
  getConversationState,
  saveConversationState,
} from '@/lib/db/queries/whatsapp-conversations'
import { rateLimit } from '@/lib/security/rate-limit'
import { sendWhatsappReply } from '@/lib/whatsapp/client'
import {
  advanceConversation,
  buildRegistrationFailureOutcome,
  isConversationResetText,
} from '@/lib/whatsapp/conversation'
import { resolveWhatsappCoverageInput } from '@/lib/whatsapp/coverage'
import { extractInboundMessage } from '@/lib/whatsapp/payload'
import { hydrateWhatsappReply } from '@/lib/whatsapp/reply'
import { isValidWhatsappSignature } from '@/lib/whatsapp/signature'

// Prisma não roda no Edge.
export const runtime = 'nodejs'

const RATE_LIMIT = { limit: 30, windowMs: 60_000 }

/** Base pública do site para os links enviados pelo bot. */
function getSiteUrl(request: NextRequest): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/u, '')
  if (explicit) return explicit
  return request.nextUrl.origin
}

/** Verificação inicial exigida pela Meta. */
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

/**
 * Recebe uma mensagem, avança a máquina de estados, persiste o mínimo necessário
 * e responde. Depois de uma assinatura válida, devolve 200 inclusive em falha
 * interna para não provocar reenvios e respostas duplicadas pela Meta.
 */
export async function POST(request: NextRequest) {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim()
  const rawBody = await request.text()

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

    // Recibos de entrega e leitura chegam neste endpoint sem `messages`.
    const message = extractInboundMessage(payload)
    if (!message) return ok

    // O telefone é somente chave efêmera do limitador em memória; não vai a log.
    if (!rateLimit(`whatsapp:${message.from}`, RATE_LIMIT).success) return ok

    const profile = await findNutrizByWhatsapp(message.from)
    const state = await getConversationState(message.from)
    const coverage =
      state.step === 'AWAITING_COVERAGE' &&
      message.text &&
      !isConversationResetText(message.text)
        ? await resolveWhatsappCoverageInput(message.text)
        : undefined

    let outcome = advanceConversation({
      step: state.step,
      context: state.context,
      misunderstoodCount: state.misunderstoodCount,
      text: message.text,
      replyId: message.replyId,
      coverage,
      profile,
      isNewConversation: state.isNewConversation,
    })

    let nutrizProfileId = profile?.id ?? null
    if (outcome.effect.kind === 'create_lead') {
      let created: Awaited<ReturnType<typeof createWhatsappNutrizLead>> = null
      try {
        created = await createWhatsappNutrizLead({
          phoneWhatsapp: message.from,
          fullName: outcome.effect.fullName,
          city: outcome.effect.city,
          state: outcome.effect.state,
        })
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // O erro técnico não inclui os dados recebidos na mensagem.
          console.error('[whatsapp] cadastro não gravado', error)
        }
      }

      if (created) {
        nutrizProfileId = created.id
      } else {
        outcome = buildRegistrationFailureOutcome(state.context)
      }
    }

    await saveConversationState({
      phoneWhatsapp: message.from,
      nutrizProfileId,
      step: outcome.nextStep,
      context: outcome.context,
      misunderstoodCount: outcome.misunderstoodCount,
    })

    await sendWhatsappReply({
      to: message.from,
      reply: hydrateWhatsappReply(outcome.reply, getSiteUrl(request)),
    })

    return ok
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // Só o erro técnico: nunca o corpo, número, nome, CEP ou texto recebido.
      console.error('[POST /api/whatsapp/webhook]', error)
    }
    return ok
  }
}
