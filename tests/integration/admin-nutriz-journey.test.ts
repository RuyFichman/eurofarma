import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { prisma } from '../../lib/db/prisma'
import {
  applyAdminNutrizJourneyStatusTransition,
  transitionAdminNutrizJourneyStatus,
} from '../../lib/db/queries/admin-nutriz-journey'
import {
  JOURNEY_STATUS_VALUES,
  type JourneyStatusValue,
} from '../../lib/journey/status'
import { createTestNutrizProfile } from '../helpers/factories'

class RollbackIntegrationTest extends Error {}

type JourneyTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

async function createJourneyFixtures(
  transaction: JourneyTransactionClient,
  nutrizId: string,
) {
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
  return admin
}

/**
 * Executa o corpo numa transação sempre revertida e confirma que nenhum
 * perfil de teste sobreviveu no banco compartilhado.
 */
async function withRolledBackJourney(
  body: (
    transaction: JourneyTransactionClient,
    ids: { nutrizId: string; adminId: string },
  ) => Promise<void>,
) {
  const nutrizId = randomUUID()
  let rolledBack = false

  try {
    await prisma.$transaction(
      async (transaction) => {
        const admin = await createJourneyFixtures(transaction, nutrizId)
        await body(transaction, { nutrizId, adminId: admin.id })
        throw new RollbackIntegrationTest()
      },
      { timeout: 30_000 },
    )
  } catch (error) {
    if (!(error instanceof RollbackIntegrationTest)) throw error
    rolledBack = true
  }

  expect(rolledBack).toBe(true)
  await expect(
    prisma.nutrizProfile.findUnique({ where: { id: nutrizId } }),
  ).resolves.toBeNull()
}

describe('atualização transacional da jornada', () => {
  it('atualiza o perfil, registra o autor e recusa uma versão anterior', async () => {
    await withRolledBackJourney(async (transaction, { nutrizId, adminId }) => {
      const first = await applyAdminNutrizJourneyStatusTransition(transaction, {
        nutrizProfileId: nutrizId,
        fromStatus: 'REGISTERED',
        toStatus: 'FORM_RECEIVED',
        administrativeNote: 'Ficha recebida pela equipe.',
        changedByUserId: adminId,
      })
      const stale = await applyAdminNutrizJourneyStatusTransition(transaction, {
        nutrizProfileId: nutrizId,
        fromStatus: 'REGISTERED',
        toStatus: 'FORM_RECEIVED',
        changedByUserId: adminId,
      })

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
          changedByUserId: adminId,
          administrativeNote: 'Ficha recebida pela equipe.',
        },
      ])

      const outbox = await transaction.notificationOutbox.findMany({
        where: { nutrizProfileId: nutrizId },
        select: {
          status: true,
          kind: true,
          journeyStatusHistoryId: true,
          lastErrorCode: true,
        },
      })
      expect(outbox).toEqual([
        {
          status: 'SUPPRESSED',
          kind: 'JOURNEY_STATUS_CHANGED',
          journeyStatusHistoryId: expect.any(String),
          lastErrorCode: 'CONSENT_NOT_GRANTED',
        },
      ])
    })
  })

  it('enfileira exatamente um aviso quando há opt-in específico vigente', async () => {
    await withRolledBackJourney(async (transaction, { nutrizId, adminId }) => {
      const consent = await transaction.communicationConsentEvent.create({
        data: {
          nutrizProfileId: nutrizId,
          purpose: 'JOURNEY_STATUS_WHATSAPP',
          decision: 'GRANTED',
          source: 'WEB',
          policyVersion: 'test.v1',
        },
      })

      await applyAdminNutrizJourneyStatusTransition(transaction, {
        nutrizProfileId: nutrizId,
        fromStatus: 'REGISTERED',
        toStatus: 'FORM_RECEIVED',
        changedByUserId: adminId,
      })

      const outbox = await transaction.notificationOutbox.findMany({
        where: { nutrizProfileId: nutrizId },
        select: {
          idempotencyKey: true,
          status: true,
          consentEventId: true,
          journeyStatusHistoryId: true,
        },
      })
      expect(outbox).toHaveLength(1)
      expect(outbox[0]).toEqual({
        idempotencyKey: `journey-status:${outbox[0]?.journeyStatusHistoryId}`,
        status: 'PENDING',
        consentEventId: consent.id,
        journeyStatusHistoryId: expect.any(String),
      })
    })
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

  it('percorre todos os marcos novos até a aptidão para recorrência', async () => {
    const path: JourneyStatusValue[] = [
      'REGISTERED',
      'DOCUMENT_SENT',
      'FORM_RECEIVED',
      'EXAM_SCHEDULED',
      'EXAMS_COMPLETED',
      'AWAITING_RESULT',
      'ELIGIBLE',
      'KIT_SENT',
      'KIT_DELIVERED',
      'DONATION_CONFIRMED',
      'RECURRING_DONATION_ELIGIBLE',
    ]

    await withRolledBackJourney(async (transaction, { nutrizId, adminId }) => {
      for (let index = 1; index < path.length; index += 1) {
        const result = await applyAdminNutrizJourneyStatusTransition(
          transaction,
          {
            nutrizProfileId: nutrizId,
            fromStatus: path[index - 1]!,
            toStatus: path[index]!,
            changedByUserId: adminId,
          },
        )
        expect(result).toEqual({ status: 'UPDATED' })
      }

      await expect(
        transaction.nutrizProfile.findUniqueOrThrow({
          where: { id: nutrizId },
          select: { journeyStatus: true },
        }),
      ).resolves.toEqual({ journeyStatus: 'RECURRING_DONATION_ELIGIBLE' })

      const history = await transaction.journeyStatusHistory.findMany({
        where: { nutrizProfileId: nutrizId },
        select: { fromStatus: true, toStatus: true },
      })
      expect(history).toHaveLength(path.length - 1)
      expect(history).toEqual(
        expect.arrayContaining(
          path.slice(1).map((toStatus, index) => ({
            fromStatus: path[index],
            toStatus,
          })),
        ),
      )
    })
  })

  it('mantém no CHECK do banco as transições antigas e recusa atalhos pelos marcos novos', async () => {
    const accepted: Array<[JourneyStatusValue, JourneyStatusValue]> = [
      ['REGISTERED', 'FORM_RECEIVED'],
      ['EXAM_SCHEDULED', 'AWAITING_RESULT'],
      ['ELIGIBLE', 'KIT_DELIVERED'],
      ['KIT_DELIVERED', 'RECURRING_DONATION_ELIGIBLE'],
      ['REGISTERED', 'DOCUMENT_SENT'],
      ['EXAM_SCHEDULED', 'EXAMS_COMPLETED'],
      ['ELIGIBLE', 'KIT_SENT'],
      ['KIT_DELIVERED', 'DONATION_CONFIRMED'],
    ]
    const rejected: Array<[JourneyStatusValue, JourneyStatusValue]> = [
      ['REGISTERED', 'EXAMS_COMPLETED'],
      ['DOCUMENT_SENT', 'EXAM_SCHEDULED'],
      ['EXAMS_COMPLETED', 'ELIGIBLE'],
      ['NOT_ELIGIBLE', 'KIT_SENT'],
      ['KIT_SENT', 'DONATION_CONFIRMED'],
      ['DONATION_CONFIRMED', 'KIT_DELIVERED'],
    ]

    await withRolledBackJourney(async (transaction, { nutrizId, adminId }) => {
      // Insere direto na tabela, contornando as regras da aplicação, para
      // exercitar somente o CHECK. Cada tentativa fica num savepoint para que
      // uma violação não aborte a transação inteira.
      const probe = async (
        from: JourneyStatusValue,
        to: JourneyStatusValue,
      ) => {
        await transaction.$executeRaw`SAVEPOINT journey_probe`
        try {
          await transaction.$executeRaw`
            INSERT INTO "journey_status_history"
              ("id", "nutriz_profile_id", "from_status", "to_status", "changed_by_user_id")
            VALUES (${randomUUID()}, ${nutrizId}, ${from}::"JourneyStatus", ${to}::"JourneyStatus", ${adminId})`
          return 'accepted'
        } catch (error) {
          await transaction.$executeRaw`ROLLBACK TO SAVEPOINT journey_probe`
          expect(String(error)).toContain(
            'journey_status_history_valid_transition_check',
          )
          return 'rejected'
        } finally {
          await transaction.$executeRaw`RELEASE SAVEPOINT journey_probe`
        }
      }

      for (const [from, to] of accepted) {
        await expect(probe(from, to), `${from} -> ${to}`).resolves.toBe(
          'accepted',
        )
      }
      for (const [from, to] of rejected) {
        await expect(probe(from, to), `${from} -> ${to}`).resolves.toBe(
          'rejected',
        )
      }
    })
  })

  it('espelha no enum do banco a ordem de JOURNEY_STATUS_VALUES', async () => {
    const rows = await prisma.$queryRaw<Array<{ label: string }>>`
      SELECT e.enumlabel AS label
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'JourneyStatus'
      ORDER BY e.enumsortorder`

    expect(rows.map((row) => row.label)).toEqual([...JOURNEY_STATUS_VALUES])
  })
})
