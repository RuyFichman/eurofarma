import { Prisma } from '@prisma/client'

import { prisma } from '../prisma'
import { buildBrazilianWhatsappCandidates } from '../../whatsapp/phone-candidates'
import type {
  ActiveConversationStep,
  ConversationContext,
  ConversationProfile,
  ConversationStep,
  DonationStepId,
  FailureReason,
} from '../../whatsapp/conversation'

/** Encontra somente perfis ativos pelas variações brasileiras do número. */
export async function findNutrizByWhatsapp(
  fromDigits: string,
): Promise<({ id: string } & ConversationProfile) | null> {
  const candidates = buildBrazilianWhatsappCandidates(fromDigits)
  if (candidates.length === 0) return null

  const profile = await prisma.nutrizProfile.findFirst({
    where: { phoneWhatsapp: { in: candidates }, deletedAt: null },
    select: {
      id: true,
      fullName: true,
      journeyStatus: true,
      communicationConsents: {
        where: { purpose: 'REMINDERS_WHATSAPP' },
        orderBy: { sequence: 'desc' },
        take: 1,
        select: { decision: true },
      },
    },
  })
  if (!profile) return null

  return {
    id: profile.id,
    fullName: profile.fullName,
    journeyStatus: profile.journeyStatus,
    reminderConsentEnabled:
      profile.communicationConsents[0]?.decision === 'GRANTED',
  }
}

export type ConversationState = {
  step: ConversationStep
  context: ConversationContext
  misunderstoodCount: number
  isNewConversation: boolean
}

function parseConversationContext(
  value: Prisma.JsonValue | null,
): ConversationContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const candidate = value as Record<string, Prisma.JsonValue>
  const context: ConversationContext = {}

  const location = candidate.location
  if (location && typeof location === 'object' && !Array.isArray(location)) {
    const locationRecord = location as Record<string, Prisma.JsonValue>
    if (
      typeof locationRecord.city === 'string' &&
      locationRecord.city.length >= 2 &&
      locationRecord.city.length <= 100 &&
      typeof locationRecord.state === 'string' &&
      /^[A-Z]{2}$/u.test(locationRecord.state)
    ) {
      context.location = {
        city: locationRecord.city,
        state: locationRecord.state,
      }
    }
  }

  const zapiReplyOptionIds = candidate.zapiReplyOptionIds
  if (
    Array.isArray(zapiReplyOptionIds) &&
    zapiReplyOptionIds.length > 0 &&
    zapiReplyOptionIds.length <= 10
  ) {
    const optionIds = zapiReplyOptionIds.filter(
      (value): value is string =>
        typeof value === 'string' && /^[a-z0-9_-]{1,64}$/iu.test(value),
    )
    if (optionIds.length === zapiReplyOptionIds.length) {
      context.zapiReplyOptionIds = optionIds
    }
  }

  const faqStep = candidate.faqStep
  if (
    typeof faqStep === 'string' &&
    (['HEALTH_FORM', 'KIT', 'EXTRACTION', 'COLLECTION'] as const).includes(
      faqStep as DonationStepId,
    )
  ) {
    context.faqStep = faqStep as DonationStepId
  }

  const registration = candidate.registration
  if (
    registration &&
    typeof registration === 'object' &&
    !Array.isArray(registration)
  ) {
    const registrationRecord = registration as Record<string, Prisma.JsonValue>
    const fullName = registrationRecord.fullName
    const cpf = registrationRecord.cpf
    const email = registrationRecord.email
    const address = registrationRecord.address

    const draft: NonNullable<ConversationContext['registration']> = {}
    if (
      typeof fullName === 'string' &&
      fullName.length >= 3 &&
      fullName.length <= 120
    ) {
      draft.fullName = fullName
    }
    if (typeof cpf === 'string' && /^\d{11}$/u.test(cpf)) {
      draft.cpf = cpf
    }
    if (
      typeof email === 'string' &&
      email.length >= 3 &&
      email.length <= 254 &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(email)
    ) {
      draft.email = email
    }
    if (
      typeof address === 'string' &&
      address.length >= 5 &&
      address.length <= 300
    ) {
      draft.address = address
    }

    if (Object.keys(draft).length > 0) context.registration = draft
  }

  return context
}

/**
 * Estado atual da conversa. O contexto aceita município/UF e, no fluxo Z-API,
 * IDs técnicos da última lista; nome, CEP e texto livre nunca são reidratados
 * nem persistidos antes do cadastro.
 */
export async function getConversationState(
  phoneWhatsapp: string,
): Promise<ConversationState> {
  const row = await prisma.whatsappConversation.findUnique({
    where: { phoneWhatsapp },
    select: { step: true, context: true, misunderstoodCount: true },
  })

  return {
    step: row?.step ?? 'MENU',
    context: parseConversationContext(row?.context ?? null),
    misunderstoodCount: row?.misunderstoodCount ?? 0,
    isNewConversation: row === null,
  }
}

/** Grava somente o estado ativo e marca a última atividade da conversa. */
export async function saveConversationState(params: {
  phoneWhatsapp: string
  nutrizProfileId: string | null
  step: ActiveConversationStep
  context: ConversationContext
  misunderstoodCount: number
}): Promise<void> {
  const context = Object.keys(params.context).length
    ? (params.context as Prisma.InputJsonObject)
    : Prisma.DbNull
  const data = {
    step: params.step,
    context,
    misunderstoodCount: params.misunderstoodCount,
    lastMessageAt: new Date(),
    nutrizProfileId: params.nutrizProfileId,
  }

  await prisma.whatsappConversation.upsert({
    where: { phoneWhatsapp: params.phoneWhatsapp },
    update: data,
    create: { phoneWhatsapp: params.phoneWhatsapp, ...data },
  })
}

/**
 * Cria o cadastro feito dentro do WhatsApp (nome, CPF, e-mail e endereço). O
 * aceite acontece no passo imediatamente anterior; lembretes e marketing
 * continuam desligados.
 */
export async function createWhatsappNutrizLead(params: {
  phoneWhatsapp: string
  fullName: string
  cpf: string
  email: string
  address: string
  city: string
  state: string
}): Promise<({ id: string } & ConversationProfile) | null> {
  const existing = await findNutrizByWhatsapp(params.phoneWhatsapp)
  if (existing) return existing

  try {
    const created = await prisma.$transaction(async (transaction) => {
      const profile = await transaction.nutrizProfile.create({
        data: {
          fullName: params.fullName,
          phoneWhatsapp: params.phoneWhatsapp,
          cpf: params.cpf,
          email: params.email,
          address: params.address,
          city: params.city,
          state: params.state,
          contactPreference: 'WHATSAPP',
          interestStatus: 'INTERESTED',
          lgpdConsentAt: new Date(),
          marketingConsent: false,
          sourceUtm: {
            utm_source: 'whatsapp',
            utm_medium: 'chatbot',
          },
        },
        select: { id: true, fullName: true, journeyStatus: true },
      })
      await transaction.nutrizRecognition.create({
        data: {
          nutrizProfileId: profile.id,
          kind: 'JOURNEY_STARTED',
          journeyStatus: 'REGISTERED',
        },
        select: { id: true },
      })
      return profile
    })
    return { ...created, reminderConsentEnabled: false }
  } catch (error) {
    const isDuplicate =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    if (!isDuplicate) throw error

    // O alvo do índice único diz qual campo colidiu. Se foi o telefone, é a
    // mesma nutriz reenviando (idempotência normal). Se foi o CPF, é um dado
    // já usado por outro perfil — devolver esse outro perfil criaria um
    // cadastro fantasma; melhor sinalizar falha e deixar a nutriz tentar de
    // novo (o handler pede o nome novamente, reiniciando os quatro campos).
    const target = Array.isArray(
      (error as Prisma.PrismaClientKnownRequestError).meta?.target,
    )
      ? ((error as Prisma.PrismaClientKnownRequestError).meta
          ?.target as string[])
      : []
    if (target.includes('cpf')) return null

    return findNutrizByWhatsapp(params.phoneWhatsapp)
  }
}

/** `AGD-2026-04892` — ano corrente e cinco dígitos. Legado preservado. */
function buildReference(now: Date): string {
  const year = now.getUTCFullYear()
  const random = Math.floor(Math.random() * 100_000)
    .toString()
    .padStart(5, '0')
  return `AGD-${year}-${random}`
}

/** Escrita legada, fora do fluxo ativo do webhook. */
async function createAppointment(
  data: Omit<Prisma.AppointmentUncheckedCreateInput, 'reference'>,
): Promise<{ id: string; reference: string } | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.appointment.create({
        data: { ...data, reference: buildReference(new Date()) },
        select: { id: true, reference: true },
      })
    } catch (error) {
      const isDuplicate =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      if (!isDuplicate) throw error
    }
  }
  return null
}

export async function createDeclaredAppointment(params: {
  nutrizProfileId: string
  scheduledAt: Date
}): Promise<{ id: string; reference: string } | null> {
  return createAppointment({
    nutrizProfileId: params.nutrizProfileId,
    status: 'DECLARED',
    scheduledAt: params.scheduledAt,
    declaredAt: new Date(),
  })
}

export async function createNotScheduledAppointment(params: {
  nutrizProfileId: string
  reason: FailureReason
}): Promise<{ id: string; reference: string } | null> {
  return createAppointment({
    nutrizProfileId: params.nutrizProfileId,
    status: 'NOT_SCHEDULED',
    failureReason: params.reason,
    declaredAt: new Date(),
  })
}
