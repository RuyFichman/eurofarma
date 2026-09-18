import { NextResponse, type NextRequest } from 'next/server'

import { processInboundWhatsappMessage } from '@/lib/whatsapp/process-inbound'
import { extractTwilioInboundMessage } from '@/lib/whatsapp/twilio-payload'
import { getTwilioWhatsAppProvider } from '@/lib/whatsapp/twilio-provider'
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

function twimlResponse(status = 200) {
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
    status,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
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
    return twimlResponse(401)
  }

  const message = extractTwilioInboundMessage(form)
  if (!message) return twimlResponse()

  try {
    await processInboundWhatsappMessage({
      message,
      provider: getTwilioWhatsAppProvider(),
      inboundProvider: 'TWILIO',
      siteUrl: getSiteUrl(request),
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[POST /api/whatsapp/twilio]', error)
    }
  }

  return twimlResponse()
}
