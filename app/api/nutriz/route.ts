import { NextResponse, type NextRequest } from 'next/server'
import { ContactPreference, InterestStatus, Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { nutrizSignupApiSchema } from '@/lib/validators/nutriz'
import { sanitizeSourceUtm } from '@/lib/utils/utm'
import { jsonError } from '@/lib/utils/api-errors'

// Prisma roda melhor no Node runtime (não Edge).
export const runtime = 'nodejs'

// TODO(LCT-4.4): adicionar rate limiting antes de exposição pública.
// Dispensado a pedido do time (MVP): anti-spam Turnstile (LCT-4.2). Antes de
// qualquer exposição pública, habilitar o RLS em `nutriz_profiles` (pendência
// de segurança do CLAUDE.md — hoje a tabela é legível pela publishable key).

/**
 * `POST /api/nutriz` — cadastro **opcional** de interesse da nutriz. A usuária
 * pode usar o site, buscar bancos e falar pelo WhatsApp sem se cadastrar; este
 * endpoint só persiste os dados de quem escolher deixar contato.
 *
 * Coleta mínima sob LGPD (nome, WhatsApp, UF, cidade, consentimento, UTMs).
 * Nunca retorna dados pessoais e nunca expõe erro interno do Prisma.
 */
export async function POST(request: NextRequest) {
  // 1. Ler JSON do corpo.
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonError(
      'INVALID_JSON',
      'Não foi possível ler os dados enviados.',
      400,
    )
  }

  // 2. Validar payload (campos extras são descartados pelo Zod).
  const parsed = nutrizSignupApiSchema.safeParse(payload)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const fields: Record<string, string> = {}
    for (const [key, messages] of Object.entries(fieldErrors)) {
      const first = messages?.[0]
      if (first) fields[key] = first
    }

    // Código específico quando o ÚNICO problema é o consentimento LGPD
    // (facilita o frontend). Se houver outros campos inválidos juntos, cai no
    // VALIDATION_ERROR detalhado abaixo.
    if (fields.lgpdConsent && Object.keys(fields).length === 1) {
      return jsonError(
        'LGPD_CONSENT_REQUIRED',
        'É necessário aceitar a Política de Privacidade para continuar.',
        400,
      )
    }

    return jsonError(
      'VALIDATION_ERROR',
      'Revise os campos informados.',
      400,
      fields,
    )
  }

  // 3. Normalizar (Zod já entregou `phoneWhatsapp` com DDI 55 e `state` em UF maiúscula).
  const { fullName, phoneWhatsapp, state, city, sourceUtm } = parsed.data
  const sanitizedUtm = sanitizeSourceUtm(sourceUtm)
  const utmValue: Prisma.InputJsonValue | undefined = sanitizedUtm
    ? (sanitizedUtm as Prisma.InputJsonValue)
    : undefined

  // 4. Persistir. `phoneWhatsapp` NÃO é @unique no schema → upsert lógico
  //    (findFirst + update/create) dentro de uma transaction.
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.nutrizProfile.findFirst({
        where: { phoneWhatsapp },
        select: { id: true },
      })

      if (existing) {
        await tx.nutrizProfile.update({
          where: { id: existing.id },
          data: {
            fullName: fullName.trim(),
            state,
            city: city.trim(),
            lgpdConsentAt: new Date(),
            marketingConsent: false,
            contactPreference: ContactPreference.WHATSAPP,
            interestStatus: InterestStatus.INTERESTED,
            // Novo interesse reativa um cadastro que tenha sido removido (soft delete).
            deletedAt: null,
            // Só sobrescreve a atribuição se vier UTM nova (preserva o first-touch).
            ...(utmValue !== undefined ? { sourceUtm: utmValue } : {}),
          },
        })
        return
      }

      await tx.nutrizProfile.create({
        data: {
          fullName: fullName.trim(),
          phoneWhatsapp,
          state,
          city: city.trim(),
          lgpdConsentAt: new Date(),
          marketingConsent: false,
          contactPreference: ContactPreference.WHATSAPP,
          interestStatus: InterestStatus.INTERESTED,
          sourceUtm: utmValue ?? Prisma.JsonNull,
        },
      })
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // Loga apenas o erro técnico — NUNCA o payload/PII da nutriz.
      console.error('[POST /api/nutriz] persistence error', error)
    }
    return jsonError(
      'INTERNAL_ERROR',
      'Não foi possível concluir o cadastro agora.',
      500,
    )
  }

  // 5. Sucesso — corpo sem nenhum dado pessoal.
  return NextResponse.json(
    { ok: true },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  )
}
