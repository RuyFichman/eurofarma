import { NextResponse, type NextRequest } from 'next/server'

import { recordContactChannelClick } from '../../../lib/db/queries/contact-clicks'
import { CONTACT_TRACKING } from '../../../lib/i18n/pt-br'
import { getClientIp } from '../../../lib/security/client-ip'
import { rateLimit } from '../../../lib/security/rate-limit'
import { jsonError } from '../../../lib/utils/api-errors'
import { sanitizeSourceUtm } from '../../../lib/utils/utm'
import { contactClickSchema } from '../../../lib/validators/contact-click'

export const runtime = 'nodejs'

/**
 * RF07 — registro dos cliques nos canais oficiais do Lactare.
 *
 * É um route handler, e não uma Server Action, porque o cliente dispara por
 * `navigator.sendBeacon` ao sair da página para o WhatsApp ou para o discador.
 *
 * Substitui o tracking legado de unidades (`POST /api/track`, hoje 410 Gone):
 * não recebe `unit_id`, não lê o CEP consultado e não guarda IP, referrer nem
 * qualquer identificador da visitante. O IP é usado apenas como chave efêmera
 * do rate limit em memória, que não persiste nada.
 */
const RATE_LIMIT = { limit: 20, windowMs: 60_000 } as const
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const

export async function POST(request: NextRequest) {
  const limited = rateLimit(
    `contact-click:${getClientIp(request.headers)}`,
    RATE_LIMIT,
  )
  if (!limited.success) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: CONTACT_TRACKING.api.rateLimited,
        },
      },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          'Retry-After': String(limited.retryAfterSeconds),
        },
      },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonError('INVALID_JSON', CONTACT_TRACKING.api.invalidJson, 400)
  }

  const parsed = contactClickSchema.safeParse(payload)
  if (!parsed.success) {
    return jsonError(
      'INVALID_CONTACT_CLICK',
      CONTACT_TRACKING.api.invalidPayload,
      400,
    )
  }

  try {
    await recordContactChannelClick({
      channel: parsed.data.channel,
      surface: parsed.data.surface,
      sourceUtm: sanitizeSourceUtm(parsed.data.source_utm),
    })
  } catch {
    // Sem detalhe do banco na resposta: o endpoint é público e anônimo.
    return jsonError(
      'CONTACT_CLICK_UNAVAILABLE',
      CONTACT_TRACKING.api.unavailable,
      503,
    )
  }

  // 204: o `sendBeacon` descarta o corpo e a métrica não devolve nada útil.
  return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS })
}
