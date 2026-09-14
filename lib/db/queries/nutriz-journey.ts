import type { Prisma } from '@prisma/client'

import { nutrizProfileIdSchema } from '../../validators/journey-status'
import { prisma } from '../prisma'

/**
 * Recorte seguro da jornada para a própria nutriz.
 *
 * Não seleciona a observação administrativa, o autor da mudança nem o status
 * anterior. Esses dados existem para a auditoria interna do Lactare e não são
 * necessários para orientar a nutriz na área pessoal.
 */
const NUTRIZ_JOURNEY_SELECT = {
  journeyStatus: true,
  createdAt: true,
  journeyHistory: {
    select: {
      id: true,
      toStatus: true,
      changedAt: true,
    },
    orderBy: [{ changedAt: 'asc' }, { id: 'asc' }],
  },
} as const satisfies Prisma.NutrizProfileSelect

export type NutrizJourneySnapshot = Prisma.NutrizProfileGetPayload<{
  select: typeof NUTRIZ_JOURNEY_SELECT
}>

export async function getNutrizJourneySnapshot(
  nutrizProfileId: string,
): Promise<NutrizJourneySnapshot | null> {
  const id = nutrizProfileId.trim()
  if (!nutrizProfileIdSchema.safeParse(id).success) return null

  return prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: NUTRIZ_JOURNEY_SELECT,
  })
}
