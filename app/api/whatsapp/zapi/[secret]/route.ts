import { timingSafeEqual } from 'node:crypto'

import { NextResponse, type NextRequest } from 'next/server'

import { processInboundWhatsappMessage } from '@/lib/whatsapp/process-inbound'
import {
  extractZapiInboundMessage,
  isZapiTestPhoneAllowed,
} from '@/lib/whatsapp/zapi-payload'
import { getZapiWhatsAppProvider } from '@/lib/whatsapp/zapi-provider'

export const runtime = 'nodejs'

function hasMatchingSecret(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received)
  const expectedBuffer = Buffer.from(expected)
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  )
}

function getSiteUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/u, '') ??
    request.nextUrl.origin
  )
}

/**
 * Endpoint exclusivo da Z-API. A plataforma documenta o corpo recebido, mas
 * não uma assinatura de webhook; por isso o segredo opaco é obrigatório e a
 * rota ainda confere a instância, filtra eventos e delega o rate limit ao
 * processador comum antes de qualquer efeito persistente.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ secret: string }> },
) {
  const expectedSecret = process.env.ZAPI_WEBHOOK_SECRET?.trim()
  const expectedInstanceId = process.env.ZAPI_INSTANCE_ID?.trim()
  const { secret } = await context.params

  if (
    !expectedSecret ||
    !expectedInstanceId ||
    !hasMatchingSecret(secret, expectedSecret)
  ) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED' } },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const message = extractZapiInboundMessage(payload, expectedInstanceId)
  if (!message || !isZapiTestPhoneAllowed(message.from)) {
    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const provider = getZapiWhatsAppProvider()
  if (!provider) {
    return NextResponse.json(
      { error: { code: 'ZAPI_NOT_CONFIGURED' } },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    await processInboundWhatsappMessage({
      message,
      provider,
      inboundProvider: 'ZAPI',
      siteUrl: getSiteUrl(request),
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // Nunca registrar payload, telefone, texto ou segredo do webhook.
      console.error('[POST /api/whatsapp/zapi]', error)
    }
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )
}
