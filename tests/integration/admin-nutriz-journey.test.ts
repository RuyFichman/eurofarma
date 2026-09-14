import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { prisma } from '../../lib/db/prisma'
import {
  applyAdminNutrizJourneyStatusTransition,
  transitionAdminNutrizJourneyStatus,
} from '../../lib/db/queries/admin-nutriz-journey'
import { createTestNutrizProfile } from '../helpers/factories'

class RollbackIntegrationTest extends Error {}

describe('atualização transacional da jornada', () => {
  it('atualiza o perfil, registra o autor e recusa uma versão anterior', async () => {
    const nutrizId = randomUUID()
    let rolledBack = false

    try {
      await prisma.$transaction(async (transaction) => {
        const suffix = randomUUID()
        const admin = await transaction.user.create({
          data: {
            id: randomUUID(),
            email: `__test__journey-${suffix}@example.com`,
            fullName: `__test__ Admin jornada ${suffix}`,
            role: 'ADMIN',
          },
        })
        await transaction.nutrizProfile.create({
          data: {
            id: nutrizId,
            fullName: `__test__ Nutriz jornada ${suffix}`,
            phoneWhatsapp: `5500${suffix.replace(/\D/g, '').padEnd(9, '0').slice(0, 9)}`,
            state: 'SP',
            city: 'Itapevi',
            lgpdConsentAt: new Date(),
          },
        })

        const first = await applyAdminNutrizJourneyStatusTransition(
          transaction,
          {
            nutrizProfileId: nutrizId,
            fromStatus: 'REGISTERED',
            toStatus: 'FORM_RECEIVED',
            administrativeNote: 'Ficha recebida pela equipe.',
            changedByUserId: admin.id,
          },
        )
        const stale = await applyAdminNutrizJourneyStatusTransition(
          transaction,
          {
            nutrizProfileId: nutrizId,
            fromStatus: 'REGISTERED',
            toStatus: 'FORM_RECEIVED',
            changedByUserId: admin.id,
          },
        )

        expect(first).toEqual({ status: 'UPDATED' })
        expect(stale).toEqual({ status: 'CONFLICT' })
        await expect(
          transaction.nutrizProfile.findUniqueOrThrow({
            where: { id: nutrizId },
            select: { journeyStatus: true },
          }),
        ).resolves.toEqual({ journeyStatus: 'FORM_RECEIVED' })

        const history = await transaction.journeyStatusHistory.findMany({
          where: { nutrizProfileId: nutrizId },
          select: {
            fromStatus: true,
            toStatus: true,
            changedByUserId: true,
            administrativeNote: true,
          },
        })
        expect(history).toEqual([
          {
            fromStatus: 'REGISTERED',
            toStatus: 'FORM_RECEIVED',
            changedByUserId: admin.id,
            administrativeNote: 'Ficha recebida pela equipe.',
          },
        ])

        throw new RollbackIntegrationTest()
      })
    } catch (error) {
      if (!(error instanceof RollbackIntegrationTest)) throw error
      rolledBack = true
    }

    expect(rolledBack).toBe(true)
    await expect(
      prisma.nutrizProfile.findUnique({ where: { id: nutrizId } }),
    ).resolves.toBeNull()
  })

  it('reverte o status quando o histórico não pode ser criado', async () => {
    const nutriz = await createTestNutrizProfile()

    await expect(
      transitionAdminNutrizJourneyStatus({
        nutrizProfileId: nutriz.id,
        fromStatus: 'REGISTERED',
        toStatus: 'FORM_RECEIVED',
        changedByUserId: randomUUID(),
      }),
    ).rejects.toBeDefined()

    await expect(
      prisma.nutrizProfile.findUniqueOrThrow({
        where: { id: nutriz.id },
        select: { journeyStatus: true },
      }),
    ).resolves.toEqual({ journeyStatus: 'REGISTERED' })
  })
})
