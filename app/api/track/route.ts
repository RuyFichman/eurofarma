import { NextResponse, type NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { rateLimit } from '@/lib/security/rate-limit'
import { jsonError } from '@/lib/utils/api-errors'
import { sanitizeSourceUtm } from '@/lib/utils/utm'
import { whatsappClickTrackSchema } from '@/lib/validators/track'

// Prisma roda melhor no Node runtime (não Edge).
export const runtime = 'nodejs'

/**
 * Limite mais folgado que o do cadastro (5/min): quem navega na busca pode
 * abrir várias unidades no WhatsApp em sequência, e cada clique é um evento
 * legítimo. Continua em memória e **por processo** (mesma dívida da 4.4 e da
 * 5.2 — trocar por store distribuído antes de deploy multi-instância).
 */
const RATE_LIMIT = { limit: 30, windowMs: 60_000 } as const

/** Código do Prisma para violação de foreign key. */
const FOREIGN_KEY_VIOLATION = 'P2003'

/** IP do cliente a partir dos headers de proxy (fallback `unknown` em local). */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * `POST /api/track` — registra o clique da nutriz no botão de WhatsApp de uma
 * unidade (Sprint 3.8). É o que tira os indicadores de conversão do zero: sem
 * esta rota, `UnitCardActions`/`UnitDetailActions` disparam o beacon no vazio.
 *
 * Chamado por `navigator.sendBeacon` (com fallback `fetch({keepalive:true})`),
 * então a resposta é descartada pelo cliente e **nunca** bloqueia o redirect
 * para o `wa.me`. Ainda assim responde com o contrato de erro padrão do
 * projeto, para o endpoint ser testável e depurável.
 *
 * LGPD: grava só `unitId` + UTMs de campanha + referrer. **Nenhum dado
 * pessoal** — sem IP persistido, sem user agent, sem vínculo com a nutriz
 * (`nutrizProfileId` fica nulo: não há sessão de nutriz no produto).
 */
export async function POST(request: NextRequest) {
  // 1. Rate limiting por IP (o IP é usado só como chave em memória, não é salvo).
  const ip = getClientIp(request)
  const limited = rateLimit(`track:${ip}`, RATE_LIMIT)
  if (!limited.success) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: 'Muitos eventos em pouco tempo.',
        },
      },
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': String(limited.retryAfterSeconds),
        },
      },
    )
  }

  // 2. Ler JSON do corpo. `sendBeacon` manda um Blob application/json.
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonError('INVALID_JSON', 'Não foi possível ler o evento.', 400)
  }

  // 3. Validar contra a lista fechada de eventos.
  const parsed = whatsappClickTrackSchema.safeParse(payload)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const fields: Record<string, string> = {}
    for (const [key, messages] of Object.entries(fieldErrors)) {
      const first = messages?.[0]
      if (first) fields[key] = first
    }
    return jsonError('VALIDATION_ERROR', 'Evento inválido.', 400, fields)
  }

  const { unit_id: unitId, source_utm: sourceUtm, referrer } = parsed.data
  const sanitizedUtm = sanitizeSourceUtm(sourceUtm)

  // 4. Persistir. Não checamos a existência da unidade com um SELECT extra:
  //    a FK já garante isso e uma consulta a mais por clique não se paga num
  //    endpoint de tracking. `unitId` inexistente cai no P2003 abaixo.
  try {
    await prisma.whatsappClick.create({
      data: {
        unitId,
        referrer,
        sourceUtm: sanitizedUtm
          ? (sanitizedUtm as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === FOREIGN_KEY_VIOLATION
    ) {
      return jsonError('UNKNOWN_UNIT', 'Unidade não encontrada.', 400)
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[POST /api/track] persistence error', error)
    }
    return jsonError(
      'INTERNAL_ERROR',
      'Não foi possível registrar o evento.',
      500,
    )
  }

  return NextResponse.json(
    { ok: true },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  )
}
