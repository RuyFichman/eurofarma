import { Prisma } from '@prisma/client'

import { prisma } from '../prisma'
import { buildBrazilianWhatsappCandidates } from '../../whatsapp/phone-candidates'
import type {
  ConversationStep,
  FailureReason,
} from '../../whatsapp/conversation'

/**
 * Encontra a nutriz dona do número que mandou a mensagem.
 *
 * `deletedAt: null` faz parte da consulta, não é filtro opcional: quem pediu
 * exclusão não volta a ter agendamento gravado só porque mandou mensagem. É a
 * mesma regra do gate da área logada.
 */
export async function findNutrizByWhatsapp(
  fromDigits: string,
): Promise<{ id: string } | null> {
  const candidates = buildBrazilianWhatsappCandidates(fromDigits)
  if (candidates.length === 0) return null

  return prisma.nutrizProfile.findFirst({
    where: { phoneWhatsapp: { in: candidates }, deletedAt: null },
    select: { id: true },
  })
}

export type ConversationState = {
  step: ConversationStep
  draftScheduledAt: Date | null
}

/**
 * Estado atual da conversa. Número novo começa em `ASKED_SCHEDULED`, que é o
 * mesmo passo do reinício — a primeira mensagem dela sempre recebe a pergunta.
 */
export async function getConversationState(
  phoneWhatsapp: string,
): Promise<ConversationState> {
  const row = await prisma.whatsappConversation.findUnique({
    where: { phoneWhatsapp },
    select: { step: true, draftScheduledAt: true },
  })

  return {
    step: row?.step ?? 'ASKED_SCHEDULED',
    draftScheduledAt: row?.draftScheduledAt ?? null,
  }
}

/** Grava o passo seguinte. `lastMessageAt` marca a atividade da conversa. */
export async function saveConversationState(params: {
  phoneWhatsapp: string
  nutrizProfileId: string | null
  step: ConversationStep
  draftScheduledAt: Date | null
}): Promise<void> {
  const data = {
    step: params.step,
    draftScheduledAt: params.draftScheduledAt,
    lastMessageAt: new Date(),
    nutrizProfileId: params.nutrizProfileId,
  }

  await prisma.whatsappConversation.upsert({
    where: { phoneWhatsapp: params.phoneWhatsapp },
    update: data,
    create: { phoneWhatsapp: params.phoneWhatsapp, ...data },
  })
}

/** `AGD-2026-04892` — ano corrente e cinco dígitos. */
function buildReference(now: Date): string {
  const year = now.getUTCFullYear()
  const random = Math.floor(Math.random() * 100_000)
    .toString()
    .padStart(5, '0')
  return `AGD-${year}-${random}`
}

/**
 * Cria o agendamento a partir do que a nutriz contou.
 *
 * A `reference` é sorteada e a coluna é `@unique`, então a colisão é resolvida
 * pelo banco (P2002) e não por um `SELECT` prévio — consultar antes de gravar
 * não elimina a corrida, só a torna mais rara. Três tentativas cobrem com folga
 * o espaço de 100 mil por ano nesta base.
 */
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

/**
 * Registra que a nutriz **não** conseguiu agendar. Não é ausência de dado: é o
 * sinal de quem quis doar e travou, e é o que alimenta a fila de retomada do
 * painel (6.6).
 */
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
