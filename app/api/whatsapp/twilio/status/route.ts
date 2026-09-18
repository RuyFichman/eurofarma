import { NextResponse, type NextRequest } from 'next/server'

import { recordTwilioDeliveryStatusEvent } from '@/lib/db/queries/notification-delivery-status-events'
import { extractTwilioDeliveryStatusEvent } from '@/lib/whatsapp/twilio-status-payload'
import { isValidTwilioSignature } from '@/lib/whatsapp/twilio-signature'

export const runtime = 'nodejs'

function getSiteUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/u, '') ??
    request.nextUrl.origin
  )
}

function getWebhookUrl(request: NextRequest): string {
  return new URL(request.nextUrl.pathname, getSiteUrl(request)).toString()
}

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  const form = new URLSearchParams(await request.text())

  if (
    !authToken ||
    !isValidTwilioSignature({
      url: getWebhookUrl(request),
      form,
      signatureHeader: request.headers.get('x-twilio-signature'),
      authToken,
    })
  ) {
    return new NextResponse(null, {
      status: 401,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const event = extractTwilioDeliveryStatusEvent(form)
  if (!event) {
    return new NextResponse(null, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  try {
    await recordTwilioDeliveryStatusEvent(event)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[POST /api/whatsapp/twilio/status]', error)
    }
  }

  return new NextResponse(null, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
