import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { prisma } from '../../lib/db/prisma'

class RollbackConsentTest extends Error {}

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

async function withConsentFixture(
  body: (
    transaction: TransactionClient,
    nutrizProfileId: string,
  ) => Promise<void>,
) {
  const nutrizProfileId = randomUUID()
  const phoneSuffix = randomUUID()
    .replace(/\D/gu, '')
    .padEnd(9, '0')
    .slice(0, 9)
  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.nutrizProfile.create({
        data: {
          id: nutrizProfileId,
          fullName: `__test__ Consentimento ${randomUUID()}`,
          phoneWhatsapp: `5500${phoneSuffix}`,
          state: 'SP',
          city: 'Itapevi',
          lgpdConsentAt: new Date(),
        },
      })
      await body(transaction, nutrizProfileId)
      throw new RollbackConsentTest()
    })
  } catch (error) {
    if (!(error instanceof RollbackConsentTest)) throw error
  }

  await expect(
    prisma.nutrizProfile.findUnique({ where: { id: nutrizProfileId } }),
  ).resolves.toBeNull()
}

describe('ledger de consentimento de lembretes', () => {
  it('registra concessão e retirada em ordem determinística', async () => {
    await withConsentFixture(async (transaction, nutrizProfileId) => {
      const granted = await transaction.communicationConsentEvent.create({
        data: {
          nutrizProfileId,
          purpose: 'REMINDERS_WHATSAPP',
          decision: 'GRANTED',
          source: 'WEB',
          policyVersion: 'test.reminders.v1',
        },
      })
      const withdrawn = await transaction.communicationConsentEvent.create({
        data: {
          nutrizProfileId,
          purpose: 'REMINDERS_WHATSAPP',
          decision: 'WITHDRAWN',
          source: 'WHATSAPP',
          policyVersion: 'test.reminders.v1',
          sourceEventId: `whatsapp:${randomUUID()}`,
        },
      })

      expect(withdrawn.sequence).toBeGreaterThan(granted.sequence)
      const latest = await transaction.communicationConsentEvent.findFirst({
        where: { nutrizProfileId, purpose: 'REMINDERS_WHATSAPP' },
        orderBy: { sequence: 'desc' },
        select: { decision: true },
      })
      expect(latest).toEqual({ decision: 'WITHDRAWN' })
    })
  })

  it('mantém os eventos append-only no banco', async () => {
    await withConsentFixture(async (transaction, nutrizProfileId) => {
      const event = await transaction.communicationConsentEvent.create({
        data: {
          nutrizProfileId,
          purpose: 'REMINDERS_WHATSAPP',
          decision: 'GRANTED',
          source: 'WEB',
          policyVersion: 'test.reminders.v1',
        },
      })

      await transaction.$executeRaw`SAVEPOINT consent_mutation_probe`
      try {
        await transaction.communicationConsentEvent.update({
          where: { id: event.id },
          data: { decision: 'WITHDRAWN' },
        })
        throw new Error('A atualização do ledger deveria ter sido rejeitada')
      } catch (error) {
        await transaction.$executeRaw`ROLLBACK TO SAVEPOINT consent_mutation_probe`
        expect(String(error)).toContain('append-only')
      } finally {
        await transaction.$executeRaw`RELEASE SAVEPOINT consent_mutation_probe`
      }
    })
  })
})
