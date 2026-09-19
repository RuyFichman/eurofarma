import { timingSafeEqual } from 'node:crypto'

import { NextResponse, type NextRequest } from 'next/server'

import { recordZapiDeliveryStatusEvent } from '@/lib/db/queries/notification-delivery-status-events'
import { extractZapiDeliveryStatusEvents } from '@/lib/whatsapp/zapi-status-payload'

export const runtime = 'nodejs'

function hasMatchingSecret(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received)
  const expectedBuffer = Buffer.from(expected)
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  )
}

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

  const events = extractZapiDeliveryStatusEvents(payload, expectedInstanceId)
  try {
    for (const event of events) await recordZapiDeliveryStatusEvent(event)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // Nunca registrar payload, telefone, conteúdo ou segredo do webhook.
      console.error('[POST /api/whatsapp/zapi/status]', error)
    }
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )
}
