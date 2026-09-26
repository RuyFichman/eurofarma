import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import type { JourneyStatus } from '@prisma/client'

import type { ActionCenterQueueKey } from '../../lib/admin/action-center/queues'
import { prisma } from '../../lib/db/prisma'
import {
  getActionCenterOverview,
  getActionCenterQueuePage,
  type ActionCenterItem,
  type ActionCenterOverview,
} from '../../lib/db/queries/admin-action-center'
import { TEST_CITY } from '../helpers/factories'

/**
 * Tudo roda numa transação sempre revertida: o histórico da jornada e a
 * auditoria de entrega são append-only e não podem ser apagados depois. Como o
 * banco cloud tem dados reais, as contagens são comparadas com uma linha de
 * base medida na mesma transação, e os itens são localizados pelo id das
 * fixtures.
 */

class RollbackIntegrationTest extends Error {}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

/** Dados sensíveis gravados nas fixtures que nunca podem aparecer na saída. */
const SENSITIVE = {
  cpf: '52998224725',
  email: '__test__central@example.com',
  address: '__test__ Rua Sigilosa, 123',
}

async function withRollback(body: (tx: Tx) => Promise<void>) {
  let rolledBack = false
  try {
    await prisma.$transaction(
      async (tx) => {
        await body(tx)
        throw new RollbackIntegrationTest()
      },
      { timeout: 60_000 },
    )
  } catch (error) {
    if (!(error instanceof RollbackIntegrationTest)) throw error
    rolledBack = true
  }
  expect(rolledBack).toBe(true)
}

let phoneCounter = 0
function fakePhone(): string {
  phoneCounter += 1
  return `5500${String(Date.now() % 1_000_000).padStart(6, '0')}${String(phoneCounter).padStart(3, '0')}`
}

async function createAdmin(tx: Tx) {
  const suffix = randomUUID()
  return tx.user.create({
    data: {
      id: randomUUID(),
      email: `__test__central-${suffix}@example.com`,
      fullName: `__test__ Admin central ${suffix}`,
      role: 'ADMIN',
    },
    select: { id: true },
  })
}

async function createProfile(
  tx: Tx,
  params: {
    status: JourneyStatus
    createdAt: Date
    deletedAt?: Date
    kitDeliveryScheduledAt?: Date
    sensitive?: boolean
  },
) {
  return tx.nutrizProfile.create({
    data: {
      fullName: `__test__ Central ${randomUUID()}`,
      phoneWhatsapp: fakePhone(),
      state: 'TO',
      city: TEST_CITY,
      lgpdConsentAt: params.createdAt,
      createdAt: params.createdAt,
      journeyStatus: params.status,
      deletedAt: params.deletedAt ?? null,
      kitDeliveryScheduledAt: params.kitDeliveryScheduledAt ?? null,
      ...(params.sensitive
        ? {
            cpf: SENSITIVE.cpf,
            email: SENSITIVE.email,
            address: SENSITIVE.address,
          }
        : {}),
    },
    select: { id: true },
  })
}

async function addHistory(
  tx: Tx,
  params: {
    nutrizId: string
    adminId: string
    from: JourneyStatus
    to: JourneyStatus
    changedAt: Date
  },
) {
  await tx.journeyStatusHistory.create({
    data: {
      nutrizProfileId: params.nutrizId,
      changedByUserId: params.adminId,
      fromStatus: params.from,
      toStatus: params.to,
      changedAt: params.changedAt,
    },
  })
}

function countOf(overview: ActionCenterOverview, key: ActionCenterQueueKey) {
  return overview.summaries.find((summary) => summary.key === key)?.count ?? 0
}

async function collectItems(
  tx: Tx,
  key: ActionCenterQueueKey,
  now: Date,
): Promise<ActionCenterItem[]> {
  const items: ActionCenterItem[] = []
  for (let page = 1; page <= 50; page += 1) {
    const result = await getActionCenterQueuePage(key, page, now, tx)
    items.push(...result.items)
    if (!result.pagination.hasNextPage) break
  }
  return items
}

function itemNutrizId(item: ActionCenterItem): string | null {
  if (item.kind === 'failure') return item.linkedNutrizId
  return item.nutriz?.id ?? null
}

function expectNoSensitiveData(value: unknown) {
  const serialized = JSON.stringify(value)
  expect(serialized).not.toContain(SENSITIVE.cpf)
  expect(serialized).not.toContain(SENSITIVE.email)
  expect(serialized).not.toContain(SENSITIVE.address)
  expect(serialized).not.toMatch(
    /"(cpf|email|address|phoneWhatsapp|phone_whatsapp|context)"/u,
  )
}

describe('Central de Ação — filas de jornada', () => {
  it('conta e lista exatamente as nutrizes de cada fila, sem dados sensíveis', async () => {
    await withRollback(async (tx) => {
      const now = new Date()
      const ago = (days: number) => new Date(now.getTime() - days * DAY)
      const baseline = await getActionCenterOverview(now, tx)
      const { id: adminId } = await createAdmin(tx)

      // Sem avanço: cadastro antigo sem histórico entra; recente não entra;
      // histórico recente zera a espera; NOT_ELIGIBLE e soft delete nunca entram.
      const stalled = await createProfile(tx, {
        status: 'REGISTERED',
        createdAt: ago(20),
        sensitive: true,
      })
      const recent = await createProfile(tx, {
        status: 'REGISTERED',
        createdAt: ago(3),
      })
      const recentlyUpdated = await createProfile(tx, {
        status: 'FORM_RECEIVED',
        createdAt: ago(40),
      })
      await addHistory(tx, {
        nutrizId: recentlyUpdated.id,
        adminId,
        from: 'REGISTERED',
        to: 'FORM_RECEIVED',
        changedAt: ago(2),
      })
      const notEligible = await createProfile(tx, {
        status: 'NOT_ELIGIBLE',
        createdAt: ago(100),
      })
      const deleted = await createProfile(tx, {
        status: 'REGISTERED',
        createdAt: ago(100),
        deletedAt: ago(1),
      })

      // Kit: antigo entra; recente com visita vencida entra; recente com
      // visita futura não entra.
      const kitOld = await createProfile(tx, {
        status: 'KIT_SENT',
        createdAt: ago(60),
      })
      await addHistory(tx, {
        nutrizId: kitOld.id,
        adminId,
        from: 'EXAMS_COMPLETED',
        to: 'KIT_SENT',
        changedAt: ago(8),
      })
      const kitOverdue = await createProfile(tx, {
        status: 'KIT_SENT',
        createdAt: ago(60),
        kitDeliveryScheduledAt: ago(3),
      })
      await addHistory(tx, {
        nutrizId: kitOverdue.id,
        adminId,
        from: 'EXAMS_COMPLETED',
        to: 'KIT_SENT',
        changedAt: ago(2),
      })
      const kitRecent = await createProfile(tx, {
        status: 'KIT_SENT',
        createdAt: ago(60),
        kitDeliveryScheduledAt: new Date(now.getTime() + DAY),
      })
      await addHistory(tx, {
        nutrizId: kitRecent.id,
        adminId,
        from: 'EXAMS_COMPLETED',
        to: 'KIT_SENT',
        changedAt: ago(2),
      })

      // Primeira doação: kit entregue há tempo e sem doação entra; quem já
      // tem doação registrada não entra.
      const noDonation = await createProfile(tx, {
        status: 'KIT_DELIVERED',
        createdAt: ago(90),
      })
      await addHistory(tx, {
        nutrizId: noDonation.id,
        adminId,
        from: 'KIT_SENT',
        to: 'KIT_DELIVERED',
        changedAt: ago(25),
      })
      const donatedBefore = await createProfile(tx, {
        status: 'KIT_DELIVERED',
        createdAt: ago(90),
      })
      await addHistory(tx, {
        nutrizId: donatedBefore.id,
        adminId,
        from: 'KIT_DELIVERED',
        to: 'DONATION_CONFIRMED',
        changedAt: ago(40),
      })
      await addHistory(tx, {
        nutrizId: donatedBefore.id,
        adminId,
        from: 'DONATION_CONFIRMED',
        to: 'KIT_DELIVERED',
        changedAt: ago(25),
      })

      // Recorrentes: última doação antiga entra; recente não entra.
      const oldDonor = await createProfile(tx, {
        status: 'DONATION_CONFIRMED',
        createdAt: ago(200),
      })
      await addHistory(tx, {
        nutrizId: oldDonor.id,
        adminId,
        from: 'KIT_DELIVERED',
        to: 'DONATION_CONFIRMED',
        changedAt: ago(70),
      })
      const recentDonor = await createProfile(tx, {
        status: 'DONATION_CONFIRMED',
        createdAt: ago(200),
      })
      await addHistory(tx, {
        nutrizId: recentDonor.id,
        adminId,
        from: 'KIT_DELIVERED',
        to: 'DONATION_CONFIRMED',
        changedAt: ago(10),
      })

      const overview = await getActionCenterOverview(now, tx)
      expect(
        countOf(overview, 'noProgress') - countOf(baseline, 'noProgress'),
      ).toBe(1)
      expect(
        countOf(overview, 'kitNotDelivered') -
          countOf(baseline, 'kitNotDelivered'),
      ).toBe(2)
      expect(
        countOf(overview, 'firstDonation') - countOf(baseline, 'firstDonation'),
      ).toBe(1)
      expect(
        countOf(overview, 'returningDonors') -
          countOf(baseline, 'returningDonors'),
      ).toBe(1)
      expect(
        overview.summaries.find((summary) => summary.key === 'kitNotDelivered')
          ?.severity,
      ).not.toBe('low')
      expectNoSensitiveData(overview)

      const expected: Record<string, { hit: string[]; miss: string[] }> = {
        noProgress: {
          hit: [stalled.id],
          miss: [recent.id, recentlyUpdated.id, notEligible.id, deleted.id],
        },
        kitNotDelivered: {
          hit: [kitOld.id, kitOverdue.id],
          miss: [kitRecent.id],
        },
        firstDonation: { hit: [noDonation.id], miss: [donatedBefore.id] },
        returningDonors: { hit: [oldDonor.id], miss: [recentDonor.id] },
      }

      const allFixtureIds = [
        stalled,
        recent,
        recentlyUpdated,
        notEligible,
        deleted,
        kitOld,
        kitOverdue,
        kitRecent,
        noDonation,
        donatedBefore,
        oldDonor,
        recentDonor,
      ].map((profile) => profile.id)
      const seen = new Map<string, number>()

      for (const [key, { hit, miss }] of Object.entries(expected)) {
        const items = await collectItems(tx, key as ActionCenterQueueKey, now)
        const ids = items.map(itemNutrizId)
        for (const id of hit) expect(ids, `${key} inclui ${id}`).toContain(id)
        for (const id of miss)
          expect(ids, `${key} exclui ${id}`).not.toContain(id)
        for (const id of ids) {
          if (id && allFixtureIds.includes(id))
            seen.set(id, (seen.get(id) ?? 0) + 1)
        }

        // Da espera mais longa para a mais curta.
        const waits = items.map((item) => item.waitMinutes)
        expect(waits).toEqual([...waits].sort((a, b) => b - a))

        for (const item of items) {
          if (item.kind === 'profile') {
            expect(Object.keys(item.nutriz).sort()).toEqual([
              'city',
              'fullName',
              'id',
              'journeyStatus',
              'state',
            ])
          }
        }
        expectNoSensitiveData(items)
      }

      // Nenhuma nutriz aparece em duas filas de jornada.
      for (const count of seen.values()) expect(count).toBe(1)

      const kitItems = await collectItems(tx, 'kitNotDelivered', now)
      const overdueItem = kitItems.find(
        (item) => itemNutrizId(item) === kitOverdue.id,
      )
      expect(overdueItem?.severity).toBe('medium')
    })
  })
})

describe('Central de Ação — atendimento humano', () => {
  it('lista conversas pausadas, com e sem cadastro, sem telefone', async () => {
    await withRollback(async (tx) => {
      const now = new Date()
      const baseline = await getActionCenterOverview(now, tx)
      const profile = await createProfile(tx, {
        status: 'REGISTERED',
        createdAt: new Date(now.getTime() - DAY),
        sensitive: true,
      })
      const pausedAt = new Date(now.getTime() - 3 * DAY)

      const linkedPhone = fakePhone()
      const linked = await tx.whatsappConversation.create({
        data: {
          phoneWhatsapp: linkedPhone,
          nutrizProfileId: profile.id,
          step: 'HUMAN_HANDOFF',
          lastMessageAt: pausedAt,
        },
        select: { id: true },
      })
      const anonymousPhone = fakePhone()
      const anonymous = await tx.whatsappConversation.create({
        data: {
          phoneWhatsapp: anonymousPhone,
          step: 'HUMAN_HANDOFF',
          lastMessageAt: new Date(now.getTime() - DAY),
        },
        select: { id: true },
      })
      const menu = await tx.whatsappConversation.create({
        data: {
          phoneWhatsapp: fakePhone(),
          step: 'MENU',
          lastMessageAt: pausedAt,
        },
        select: { id: true },
      })

      // Duas mensagens recebidas depois da pausa e uma anterior a ela.
      for (const receivedAt of [
        new Date(pausedAt.getTime() + MINUTE),
        new Date(pausedAt.getTime() + 2 * MINUTE),
        new Date(pausedAt.getTime() - MINUTE),
      ]) {
        await tx.whatsappInboundMessage.create({
          data: {
            provider: 'TWILIO',
            providerMessageId: `__test__${randomUUID()}`,
            conversationId: linked.id,
            receivedAt,
            processingResult: 'IGNORED',
            processedAt: receivedAt,
          },
        })
      }

      const overview = await getActionCenterOverview(now, tx)
      expect(
        countOf(overview, 'humanHandoff') - countOf(baseline, 'humanHandoff'),
      ).toBe(2)

      const items = await collectItems(tx, 'humanHandoff', now)
      const keys = items.map((item) => item.key)
      expect(keys).toContain(linked.id)
      expect(keys).toContain(anonymous.id)
      expect(keys).not.toContain(menu.id)

      const linkedItem = items.find((item) => item.key === linked.id)
      const anonymousItem = items.find((item) => item.key === anonymous.id)
      expect(linkedItem?.kind === 'handoff' && linkedItem.nutriz?.id).toBe(
        profile.id,
      )
      expect(linkedItem?.kind === 'handoff' && linkedItem.ignoredMessages).toBe(
        2,
      )
      expect(
        anonymousItem?.kind === 'handoff' && anonymousItem.nutriz,
      ).toBeNull()
      // Três dias corridos acumulam horas de atendimento suficientes para "alta".
      expect(linkedItem?.severity).toBe('high')

      const serialized = JSON.stringify({ overview, items })
      expect(serialized).not.toContain(linkedPhone)
      expect(serialized).not.toContain(anonymousPhone)
      expectNoSensitiveData({ overview, items })
    })
  })
})

describe('Central de Ação — falhas de envio', () => {
  it('conta só falhas técnicas recentes e separa a fila de envio aguardando a Meta', async () => {
    await withRollback(async (tx) => {
      const now = new Date()
      const ago = (minutes: number) =>
        new Date(now.getTime() - minutes * MINUTE)
      const baseline = await getActionCenterOverview(now, tx)
      const profile = await createProfile(tx, {
        status: 'REGISTERED',
        createdAt: ago(60),
        sensitive: true,
      })

      const outbox = (status: 'FAILED' | 'PENDING', failedAt: Date | null) =>
        tx.notificationOutbox.create({
          data: {
            idempotencyKey: `__test__${randomUUID()}`,
            kind: 'REMINDER',
            status,
            nutrizProfileId: profile.id,
            payload: { category: '__test__' },
            failedAt,
            lastErrorCode: failedAt ? 'TEST_FAILED' : null,
            lastErrorAt: failedAt,
          },
          select: { id: true },
        })

      const recentFailure = await outbox('FAILED', ago(120))
      const oldFailure = await outbox('FAILED', ago(10 * 24 * 60))
      await outbox('PENDING', null)

      const inbound = (data: {
        processingResult: 'FAILED' | 'PROCESSING'
        receivedAt: Date
        replyDeliveryOutcome?: 'PERMANENT_FAILURE'
      }) =>
        tx.whatsappInboundMessage.create({
          data: {
            provider: 'ZAPI',
            providerMessageId: `__test__${randomUUID()}`,
            receivedAt: data.receivedAt,
            processingResult: data.processingResult,
            processedAt:
              data.processingResult === 'FAILED' ? data.receivedAt : null,
            replyDeliveryOutcome: data.replyDeliveryOutcome ?? null,
            replyErrorCode: data.replyDeliveryOutcome ? 'TEST_REPLY' : null,
          },
          select: { id: true },
        })

      const replyFailure = await inbound({
        processingResult: 'FAILED',
        receivedAt: ago(30),
        replyDeliveryOutcome: 'PERMANENT_FAILURE',
      })
      const stuck = await inbound({
        processingResult: 'PROCESSING',
        receivedAt: ago(30),
      })
      const inFlight = await inbound({
        processingResult: 'PROCESSING',
        receivedAt: ago(1),
      })

      // Mensagem que falhou e depois foi entregue não conta; a não entregue conta.
      const recovered = `__test__${randomUUID()}`
      const undelivered = `__test__${randomUUID()}`
      const events = [
        {
          providerMessageId: recovered,
          status: 'FAILED' as const,
          receivedAt: ago(20),
        },
        {
          providerMessageId: recovered,
          status: 'DELIVERED' as const,
          receivedAt: ago(10),
        },
        {
          providerMessageId: undelivered,
          status: 'UNDELIVERED' as const,
          receivedAt: ago(15),
        },
      ]
      for (const event of events) {
        await tx.notificationDeliveryStatusEvent.create({
          data: { provider: 'TWILIO', errorCode: 'TEST_EVT', ...event },
        })
      }

      const overview = await getActionCenterOverview(now, tx)
      expect(
        countOf(overview, 'deliveryFailures') -
          countOf(baseline, 'deliveryFailures'),
      ).toBe(4)
      expect(overview.pendingOutboxCount - baseline.pendingOutboxCount).toBe(1)

      const items = await collectItems(tx, 'deliveryFailures', now)
      const keys = items.map((item) => item.key)
      expect(keys).toContain(`OUTBOX_FAILED:${recentFailure.id}`)
      expect(keys).not.toContain(`OUTBOX_FAILED:${oldFailure.id}`)
      expect(keys).toContain(`CHATBOT_REPLY_NOT_SENT:${replyFailure.id}`)
      expect(keys).toContain(`INBOUND_STUCK:${stuck.id}`)
      expect(keys).not.toContain(`INBOUND_STUCK:${inFlight.id}`)

      const providerFailures = items.filter(
        (item) =>
          item.kind === 'failure' &&
          item.category === 'PROVIDER_UNDELIVERED' &&
          item.code === 'TEST_EVT',
      )
      expect(providerFailures).toHaveLength(1)

      const outboxItem = items.find(
        (item) => item.key === `OUTBOX_FAILED:${recentFailure.id}`,
      )
      expect(outboxItem?.kind === 'failure' && outboxItem.linkedNutrizId).toBe(
        profile.id,
      )
      expect(outboxItem?.kind === 'failure' && outboxItem.code).toBe(
        'TEST_FAILED',
      )
      expect(outboxItem?.severity).toBe('medium')

      expectNoSensitiveData({ overview, items })
    })
  })
})
