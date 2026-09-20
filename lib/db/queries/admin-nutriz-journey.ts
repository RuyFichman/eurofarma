import type { Prisma } from '@prisma/client'

import {
  nutrizProfileIdSchema,
  type AdminJourneyStatusUpdate,
} from '../../validators/journey-status'
import { getRecognitionRulesForStatus } from '../../journey/recognitions'
import { localDateTimeToDate } from '../../utils/local-date-time'
import { prisma } from '../prisma'

const ADMIN_NUTRIZ_JOURNEY_SELECT = {
  id: true,
  fullName: true,
  state: true,
  city: true,
  journeyStatus: true,
  createdAt: true,
  journeyHistory: {
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      administrativeNote: true,
      changedAt: true,
      changedByUser: {
        select: { fullName: true },
      },
    },
    orderBy: [{ changedAt: 'desc' }, { id: 'desc' }],
  },
} as const satisfies Prisma.NutrizProfileSelect

export type AdminNutrizJourneyDetail = Prisma.NutrizProfileGetPayload<{
  select: typeof ADMIN_NUTRIZ_JOURNEY_SELECT
}>

/**
 * Carrega somente os dados necessários à tela do RF16. Perfis com exclusão
 * solicitada não reaparecem por uma URL antiga ou digitada manualmente.
 */
export async function getAdminNutrizJourneyDetail(
  nutrizProfileId: string,
): Promise<AdminNutrizJourneyDetail | null> {
  const id = nutrizProfileId.trim()
  if (!nutrizProfileIdSchema.safeParse(id).success) return null

  return prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: ADMIN_NUTRIZ_JOURNEY_SELECT,
  })
}

type JourneyWriteClient = Pick<
  Prisma.TransactionClient,
  | 'nutrizProfile'
  | 'journeyStatusHistory'
  | 'communicationConsentEvent'
  | 'notificationOutbox'
  | 'nutrizRecognition'
>

export type AdminJourneyStatusMutationInput = AdminJourneyStatusUpdate & {
  changedByUserId: string
}

export type AdminJourneyStatusMutationResult =
  | { status: 'UPDATED' }
  | { status: 'NOT_FOUND' }
  | { status: 'CONFLICT' }

/**
 * Núcleo da mutação, separado para poder ser exercitado dentro de uma
 * transação revertida nos testes de integração. Em produção, use o wrapper
 * `transitionAdminNutrizJourneyStatus`, que abre a transação atômica.
 */
export async function applyAdminNutrizJourneyStatusTransition(
  client: JourneyWriteClient,
  input: AdminJourneyStatusMutationInput,
): Promise<AdminJourneyStatusMutationResult> {
  const kitDeliveryScheduledAt =
    input.toStatus === 'KIT_SENT' && input.kitDeliveryScheduledAt
      ? localDateTimeToDate(input.kitDeliveryScheduledAt)
      : null

  const updated = await client.nutrizProfile.updateMany({
    where: {
      id: input.nutrizProfileId,
      deletedAt: null,
      journeyStatus: input.fromStatus,
    },
    data: {
      journeyStatus: input.toStatus,
      // Só a transição para KIT_SENT grava a data/horário da visita — fonte
      // do lembrete de entrega do kit na área da nutriz (20/09/2026). Para
      // qualquer outro destino, o campo enviado é ignorado.
      ...(kitDeliveryScheduledAt ? { kitDeliveryScheduledAt } : {}),
    },
  })

  if (updated.count !== 1) {
    const current = await client.nutrizProfile.findFirst({
      where: { id: input.nutrizProfileId, deletedAt: null },
      select: { id: true },
    })
    return current ? { status: 'CONFLICT' } : { status: 'NOT_FOUND' }
  }

  const history = await client.journeyStatusHistory.create({
    data: {
      nutrizProfileId: input.nutrizProfileId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      changedByUserId: input.changedByUserId,
      administrativeNote: input.administrativeNote ?? null,
    },
    select: { id: true },
  })

  const recognitionRules = getRecognitionRulesForStatus(input.toStatus)
  if (recognitionRules.length > 0) {
    await client.nutrizRecognition.createMany({
      data: recognitionRules.map((rule) => ({
        nutrizProfileId: input.nutrizProfileId,
        kind: rule.kind,
        journeyStatus: rule.status,
      })),
      skipDuplicates: true,
    })
  }

  const consent = await client.communicationConsentEvent.findFirst({
    where: {
      nutrizProfileId: input.nutrizProfileId,
      purpose: 'JOURNEY_STATUS_WHATSAPP',
    },
    orderBy: { sequence: 'desc' },
    select: { id: true, decision: true },
  })
  const hasConsent = consent?.decision === 'GRANTED'

  await client.notificationOutbox.create({
    data: {
      idempotencyKey: `journey-status:${history.id}`,
      kind: 'JOURNEY_STATUS_CHANGED',
      status: hasConsent ? 'PENDING' : 'SUPPRESSED',
      nutrizProfileId: input.nutrizProfileId,
      journeyStatusHistoryId: history.id,
      consentEventId: consent?.id ?? null,
      lastErrorCode: hasConsent ? null : 'CONSENT_NOT_GRANTED',
      lastErrorAt: hasConsent ? null : new Date(),
    },
  })

  return { status: 'UPDATED' }
}

/**
 * Atualiza o estado atual, acrescenta o histórico e cria a outbox do RF17 na
 * mesma transação. O `updateMany` inclui o estado anterior no WHERE: duas abas
 * concorrentes não podem avançar a mesma versão da jornada, duplicar histórico
 * nem enfileirar dois avisos para a mesma mudança.
 */
export async function transitionAdminNutrizJourneyStatus(
  input: AdminJourneyStatusMutationInput,
): Promise<AdminJourneyStatusMutationResult> {
  return prisma.$transaction((transaction) =>
    applyAdminNutrizJourneyStatusTransition(transaction, input),
  )
}
