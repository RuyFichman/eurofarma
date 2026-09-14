import type { Prisma } from '@prisma/client'

import {
  nutrizProfileIdSchema,
  type AdminJourneyStatusUpdate,
} from '../../validators/journey-status'
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
  'nutrizProfile' | 'journeyStatusHistory'
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
  const updated = await client.nutrizProfile.updateMany({
    where: {
      id: input.nutrizProfileId,
      deletedAt: null,
      journeyStatus: input.fromStatus,
    },
    data: { journeyStatus: input.toStatus },
  })

  if (updated.count !== 1) {
    const current = await client.nutrizProfile.findFirst({
      where: { id: input.nutrizProfileId, deletedAt: null },
      select: { id: true },
    })
    return current ? { status: 'CONFLICT' } : { status: 'NOT_FOUND' }
  }

  await client.journeyStatusHistory.create({
    data: {
      nutrizProfileId: input.nutrizProfileId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      changedByUserId: input.changedByUserId,
      administrativeNote: input.administrativeNote ?? null,
    },
  })

  return { status: 'UPDATED' }
}

/**
 * Atualiza o estado atual e acrescenta o histórico na mesma transação. O
 * `updateMany` inclui o estado anterior no WHERE: duas abas concorrentes não
 * podem avançar a mesma versão da jornada nem criar histórico divergente.
 */
export async function transitionAdminNutrizJourneyStatus(
  input: AdminJourneyStatusMutationInput,
): Promise<AdminJourneyStatusMutationResult> {
  return prisma.$transaction((transaction) =>
    applyAdminNutrizJourneyStatusTransition(transaction, input),
  )
}
