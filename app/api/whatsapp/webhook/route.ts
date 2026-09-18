import { NextResponse, type NextRequest } from 'next/server'

import { getMetaWhatsAppProvider } from '@/lib/whatsapp/meta-provider'
import {
  extractDeliveryDiagnostics,
  extractInboundMessage,
} from '@/lib/whatsapp/payload'
import { processInboundWhatsappMessage } from '@/lib/whatsapp/process-inbound'
import { isValidWhatsappSignature } from '@/lib/whatsapp/signature'

// Prisma não roda no Edge.
export const runtime = 'nodejs'

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

    if (process.env.NODE_ENV === 'development') {
      for (const diagnostic of extractDeliveryDiagnostics(payload)) {
        console.info('[whatsapp] status de entrega', diagnostic)
      }
    }

    // Recibos de entrega e leitura chegam neste endpoint sem `messages`.
    const message = extractInboundMessage(payload)
    if (!message) return ok

    await processInboundWhatsappMessage({
      message,
      provider: getMetaWhatsAppProvider(),
      siteUrl: getSiteUrl(request),
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
