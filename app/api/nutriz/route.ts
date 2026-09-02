import { NextResponse, type NextRequest } from 'next/server'
import { ContactPreference, InterestStatus, Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { nutrizSignupApiSchema } from '@/lib/validators/nutriz'
import { sanitizeSourceUtm } from '@/lib/utils/utm'
import { jsonError } from '@/lib/utils/api-errors'
import { rateLimit } from '@/lib/security/rate-limit'
import { createSupabaseAdminClient } from '@/lib/auth/supabase-admin'
import { createSupabaseServerClient } from '@/lib/auth/supabase-server'

// Prisma roda melhor no Node runtime (não Edge).
export const runtime = 'nodejs'

// Rate limiting: in-memory, por IP (LCT-4.4). É por processo — antes de um deploy
// multi-instância, trocar por store distribuído (ver lib/security/rate-limit.ts).
// Dispensado a pedido do time (MVP): anti-spam Turnstile (LCT-4.2). Antes de
// qualquer exposição pública, habilitar o RLS em `nutriz_profiles` (pendência
// de segurança do CLAUDE.md — hoje a tabela é legível pela publishable key).
const RATE_LIMIT = { limit: 5, windowMs: 60_000 } as const

/** Mensagem única para conflito de conta (não distingue e-mail de WhatsApp). */
const ACCOUNT_EXISTS_MESSAGE =
  'Já existe uma conta com esses dados. Tente entrar em vez de criar uma nova.'

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
 * O Supabase sinaliza e-mail já cadastrado com 422 (ou mensagem de "already
 * registered"). Distinguir importa: duplicidade vira 409 para a usuária, e
 * qualquer outra falha vira 500 — responder "já existe conta" por causa de uma
 * indisponibilidade do Auth mandaria a nutriz para um login impossível.
 */
function isDuplicateAuthUserError(error: {
  status?: number
  message?: string
}): boolean {
  if (error.status === 422) return true
  const message = error.message?.toLowerCase() ?? ''
  return (
    message.includes('already registered') || message.includes('already been')
  )
}

/**
 * `POST /api/nutriz` — cria a **conta** da nutriz (Sprint 6.2). Até a 6.1 este
 * endpoint só gravava um lead; agora ele provisiona um usuário no Supabase Auth
 * e o vincula ao perfil por `authUserId`, porque sem conta não existe a área em
 * que o agendamento informado ao chatbot aparece.
 *
 * O cadastro **continua opcional**: buscar bancos e falar pelo WhatsApp não
 * exige conta. Coleta sob LGPD (nome, e-mail, WhatsApp, UF, cidade, senha,
 * consentimento, UTMs) — **sem CPF**. Nunca retorna dados pessoais e nunca
 * expõe erro interno do Prisma ou do Auth.
 */
export async function POST(request: NextRequest) {
  // 0. Rate limiting por IP (anti-abuso básico).
  const ip = getClientIp(request)
  const limited = rateLimit(`nutriz:${ip}`, RATE_LIMIT)
  if (!limited.success) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message:
            'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
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

    // `fields` carrega só a mensagem por campo, nunca o valor digitado — a
    // senha não trafega de volta, e o payload jamais é logado.
    return jsonError(
      'VALIDATION_ERROR',
      'Revise os campos informados.',
      400,
      fields,
    )
  }

  // 3. Normalizar (o Zod já entregou `phoneWhatsapp` com DDI 55, `state` em UF
  //    maiúscula e `email` em minúsculas).
  const { fullName, email, password, phoneWhatsapp, state, city, sourceUtm } =
    parsed.data
  const sanitizedUtm = sanitizeSourceUtm(sourceUtm)
  const utmValue: Prisma.InputJsonValue | undefined = sanitizedUtm
    ? (sanitizedUtm as Prisma.InputJsonValue)
    : undefined

  // 4. O número já tem conta? `phoneWhatsapp` é @unique desde a 6.1 (ele
  //    identifica a nutriz no chatbot), então basta um findUnique. Perfil que
  //    existe SEM `authUserId` é lead anterior à 6.2 — esse a gente adota,
  //    anexando a conta nova. Com `authUserId`, é caso de entrar, não cadastrar.
  let existing: { id: string; authUserId: string | null } | null
  try {
    existing = await prisma.nutrizProfile.findUnique({
      where: { phoneWhatsapp },
      select: { id: true, authUserId: true },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[POST /api/nutriz] lookup error', error)
    }
    return jsonError(
      'INTERNAL_ERROR',
      'Não foi possível concluir o cadastro agora.',
      500,
    )
  }

  if (existing?.authUserId) {
    return jsonError('ACCOUNT_ALREADY_EXISTS', ACCOUNT_EXISTS_MESSAGE, 409)
  }

  // 5. Criar o usuário no Supabase Auth **já confirmado**. Confirmação por
  //    e-mail fica fora do MVP de propósito: o SMTP embutido do Supabase é
  //    muito limitado e um link não clicado deixaria a nutriz sem acesso à
  //    própria área. É o mesmo risco aceito do WhatsApp não verificado
  //    (seção 13 do AGENTS.md) — reavaliar antes de exposição pública.
  const supabaseAdmin = createSupabaseAdminClient()
  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (created.error || !created.data.user) {
    if (created.error && isDuplicateAuthUserError(created.error)) {
      return jsonError('ACCOUNT_ALREADY_EXISTS', ACCOUNT_EXISTS_MESSAGE, 409)
    }
    if (process.env.NODE_ENV === 'development') {
      // Só o erro técnico — nunca o e-mail nem a senha.
      console.error('[POST /api/nutriz] auth createUser error', created.error)
    }
    return jsonError(
      'INTERNAL_ERROR',
      'Não foi possível concluir o cadastro agora.',
      500,
    )
  }

  const authUserId = created.data.user.id

  // 6. Persistir o perfil. Auth e Postgres são dois sistemas e nenhuma
  //    transação cobre os dois, então a falha aqui **desfaz** o usuário
  //    recém-criado: sem isso sobraria uma conta órfã segurando o e-mail e
  //    impedindo a próxima tentativa.
  const profileData = {
    fullName: fullName.trim(),
    email,
    state,
    city: city.trim(),
    lgpdConsentAt: new Date(),
    marketingConsent: false,
    contactPreference: ContactPreference.WHATSAPP,
    interestStatus: InterestStatus.INTERESTED,
    authUserId,
  }

  try {
    if (existing) {
      await prisma.nutrizProfile.update({
        where: { id: existing.id },
        data: {
          ...profileData,
          // Novo interesse reativa um cadastro removido (soft delete).
          deletedAt: null,
          // Só sobrescreve a atribuição se vier UTM nova (preserva o first-touch).
          ...(utmValue !== undefined ? { sourceUtm: utmValue } : {}),
        },
      })
    } else {
      await prisma.nutrizProfile.create({
        data: {
          ...profileData,
          phoneWhatsapp,
          sourceUtm: utmValue ?? Prisma.JsonNull,
        },
      })
    }
  } catch (error) {
    // Rollback best-effort: se ele também falhar, a resposta continua sendo o
    // 500 honesto e a conta órfã fica para limpeza manual.
    await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {})
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

  // 7. Abrir a sessão (o @supabase/ssr grava os cookies) para ela cair logada em
  //    `/obrigada`. Falha aqui **não** invalida o cadastro: a conta existe e ela
  //    entra pela tela de login — por isso não há rollback neste passo.
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signInWithPassword({ email, password })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[POST /api/nutriz] auto sign-in error', error)
    }
  }

  // 8. Sucesso — corpo sem nenhum dado pessoal.
  return NextResponse.json(
    { ok: true },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  )
}
