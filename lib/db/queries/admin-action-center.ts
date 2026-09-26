import { Prisma } from '@prisma/client'

import {
  getActionCenterCutoffs,
  getItemSeverity,
  isKitVisitOverdue,
  type ActionCenterCutoffs,
} from '../../admin/action-center/cutoffs'
import {
  PROFILE_QUEUE_STATUSES,
  type DeliveryFailureCategory,
  type ProfileQueueKey,
} from '../../admin/action-center/profile-queues'
import {
  ACTION_CENTER_PAGE_SIZE,
  type ActionCenterQueueKey,
} from '../../admin/action-center/queues'
import type { ActionCenterSeverity } from '../../admin/action-center/severity'
import {
  summarizeCalendarQueue,
  summarizeHumanHandoffQueue,
  type ActionCenterQueueSummary,
} from '../../admin/action-center/summary'
import {
  businessWaitMinutes,
  calendarWaitMinutes,
} from '../../admin/action-center/wait-time'
import type { JourneyStatusValue } from '../../journey/status'
import { prisma } from '../prisma'

/**
 * Consultas da Central de Ação do painel.
 *
 * Regras de exposição, válidas para todo este arquivo:
 * - o resumo é **somente agregado**: nenhuma consulta dele lê nome, telefone,
 *   e-mail, CPF ou endereço;
 * - o detalhamento lê só nome, cidade/UF e status atual — menos que a listagem
 *   `/admin/nutrizes`, que também mostra contato;
 * - CPF, endereço, e-mail, telefone, `context` da conversa e corpo de mensagem
 *   nunca são selecionados aqui.
 *
 * Todas as funções aceitam o client como parâmetro para os testes de
 * integração rodarem dentro de uma transação sempre revertida.
 */

type ActionCenterDb = Pick<
  Prisma.TransactionClient,
  '$queryRaw' | 'whatsappConversation' | 'notificationOutbox'
>

/** Limite de instantes lidos para calcular a espera comercial do handoff. */
const HANDOFF_OVERVIEW_LIMIT = 1_000

const PENDING_OUTBOX_STATUSES = [
  'PENDING',
  'RETRY_SCHEDULED',
  'PROCESSING',
] as const

const PROFILE_QUEUE_KEYS = [
  'noProgress',
  'kitNotDelivered',
  'firstDonation',
  'returningDonors',
] as const satisfies readonly ProfileQueueKey[]

function statusList(statuses: readonly JourneyStatusValue[]): Prisma.Sql {
  return Prisma.join(
    statuses.map((status) => Prisma.sql`${status}::"JourneyStatus"`),
  )
}

/**
 * Itens das filas de jornada, sem dado pessoal. Cada nutriz cai em no máximo
 * uma fila, decidida pelo status atual (`PROFILE_QUEUE_STATUSES`).
 *
 * A espera parte do último registro no histórico append-only — que é a
 * entrada no status atual — ou do cadastro, se ainda não há histórico. Para
 * possíveis doadoras recorrentes, parte da última `DONATION_CONFIRMED`.
 */
function profileQueueItemsSql(cutoffs: ActionCenterCutoffs): Prisma.Sql {
  const statuses = PROFILE_QUEUE_STATUSES
  return Prisma.sql`
    WITH candidates AS (
      SELECT
        np."id",
        np."journey_status",
        np."kit_delivery_scheduled_at",
        np."created_at",
        latest."changed_at" AS "last_changed_at",
        donation."last_donation_at",
        donation."donation_count"
      FROM "nutriz_profiles" np
      LEFT JOIN LATERAL (
        SELECT h."changed_at"
        FROM "journey_status_history" h
        WHERE h."nutriz_profile_id" = np."id"
        ORDER BY h."changed_at" DESC
        LIMIT 1
      ) latest ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          MAX(h."changed_at") AS "last_donation_at",
          COUNT(*)::int AS "donation_count"
        FROM "journey_status_history" h
        WHERE h."nutriz_profile_id" = np."id"
          AND h."to_status" = 'DONATION_CONFIRMED'::"JourneyStatus"
      ) donation ON TRUE
      WHERE np."deleted_at" IS NULL
        AND np."journey_status" IN (${statusList([
          ...statuses.noProgress,
          ...statuses.kitNotDelivered,
          ...statuses.firstDonation,
          ...statuses.returningDonors,
        ])})
    ),
    classified AS (
      SELECT
        c."id",
        c."journey_status",
        c."kit_delivery_scheduled_at",
        CASE
          WHEN c."journey_status" IN (${statusList(statuses.noProgress)})
            THEN 'noProgress'
          WHEN c."journey_status" IN (${statusList(statuses.kitNotDelivered)})
            THEN 'kitNotDelivered'
          WHEN c."journey_status" IN (${statusList(statuses.firstDonation)})
            AND c."donation_count" = 0
            THEN 'firstDonation'
          WHEN c."journey_status" IN (${statusList(statuses.returningDonors)})
            THEN 'returningDonors'
        END AS "queue",
        CASE
          WHEN c."journey_status" IN (${statusList(statuses.returningDonors)})
            THEN COALESCE(c."last_donation_at", c."last_changed_at", c."created_at")
          ELSE COALESCE(c."last_changed_at", c."created_at")
        END AS "waiting_since"
      FROM candidates c
    ),
    items AS (
      SELECT *
      FROM classified i
      WHERE (i."queue" = 'noProgress' AND i."waiting_since" <= ${cutoffs.noProgress})
        OR (
          i."queue" = 'kitNotDelivered'
          AND (
            i."waiting_since" <= ${cutoffs.kitNotDelivered}
            OR i."kit_delivery_scheduled_at" <= ${cutoffs.kitVisitOverdue}
          )
        )
        OR (i."queue" = 'firstDonation' AND i."waiting_since" <= ${cutoffs.firstDonation})
        OR (i."queue" = 'returningDonors' AND i."waiting_since" <= ${cutoffs.returningDonors})
    )
  `
}

/**
 * Falhas técnicas recentes. Só categorias, origem e códigos técnicos; o
 * vínculo com a nutriz é o id do perfil (não exibido), quando existe e o
 * perfil não pediu exclusão.
 */
function deliveryFailuresSql(cutoffs: ActionCenterCutoffs): Prisma.Sql {
  return Prisma.sql`
    WITH latest_delivery AS (
      SELECT DISTINCT ON (e."provider", e."provider_message_id")
        e."id",
        e."provider",
        e."provider_message_id",
        e."status",
        e."error_code",
        e."received_at",
        e."outbox_id"
      FROM "notification_delivery_status_events" e
      WHERE e."received_at" >= ${cutoffs.deliveryFailureLookback}
      ORDER BY e."provider", e."provider_message_id", e."received_at" DESC, e."id" DESC
    ),
    raw_failures AS (
      SELECT
        'OUTBOX_FAILED' AS "category",
        o."id" AS "ref_id",
        'OUTBOX' AS "origin",
        o."last_error_code" AS "code",
        COALESCE(o."failed_at", o."updated_at") AS "occurred_at",
        o."nutriz_profile_id"
      FROM "notification_outbox" o
      WHERE o."status" = 'FAILED'
        AND COALESCE(o."failed_at", o."updated_at") >= ${cutoffs.deliveryFailureLookback}

      UNION ALL

      SELECT
        'PROVIDER_UNDELIVERED',
        d."id",
        d."provider"::text,
        d."error_code",
        d."received_at",
        COALESCE(o."nutriz_profile_id", reply_conversation."nutriz_profile_id")
      FROM latest_delivery d
      LEFT JOIN "notification_outbox" o ON o."id" = d."outbox_id"
      LEFT JOIN "whatsapp_inbound_messages" reply
        ON d."outbox_id" IS NULL
        AND reply."provider" = d."provider"::text::"WhatsappInboundMessageProvider"
        AND reply."reply_provider_message_id" = d."provider_message_id"
      LEFT JOIN "whatsapp_conversations" reply_conversation
        ON reply_conversation."id" = reply."conversation_id"
      WHERE d."status" IN ('FAILED', 'UNDELIVERED')

      UNION ALL

      SELECT
        CASE
          WHEN m."reply_delivery_outcome" IS NULL THEN 'INBOUND_PROCESSING_FAILED'
          ELSE 'CHATBOT_REPLY_NOT_SENT'
        END,
        m."id",
        m."provider"::text,
        COALESCE(m."reply_error_code", m."reply_delivery_outcome"::text),
        COALESCE(m."processed_at", m."received_at"),
        c."nutriz_profile_id"
      FROM "whatsapp_inbound_messages" m
      LEFT JOIN "whatsapp_conversations" c ON c."id" = m."conversation_id"
      WHERE m."processing_result" = 'FAILED'
        AND m."received_at" >= ${cutoffs.deliveryFailureLookback}

      UNION ALL

      SELECT
        'INBOUND_STUCK',
        m."id",
        m."provider"::text,
        NULL,
        m."received_at",
        c."nutriz_profile_id"
      FROM "whatsapp_inbound_messages" m
      LEFT JOIN "whatsapp_conversations" c ON c."id" = m."conversation_id"
      WHERE m."processing_result" = 'PROCESSING'
        AND m."received_at" < ${cutoffs.inboundStuckProcessing}
        AND m."received_at" >= ${cutoffs.deliveryFailureLookback}
    ),
    failures AS (
      SELECT
        f."category",
        f."ref_id",
        f."origin",
        f."code",
        f."occurred_at",
        np."id" AS "linked_nutriz_id"
      FROM raw_failures f
      LEFT JOIN "nutriz_profiles" np
        ON np."id" = f."nutriz_profile_id" AND np."deleted_at" IS NULL
    )
  `
}

type QueueAggregateRow = {
  queue: string
  count: number
  oldest: Date | null
  median_epoch: number | null
  has_overdue_visit: boolean | null
}

function epochToDate(value: number | null): Date | null {
  return value === null ? null : new Date(Number(value) * 1000)
}

function medianWaitFromEpoch(value: number | null, now: Date): number | null {
  const median = epochToDate(value)
  return median ? calendarWaitMinutes(median, now) : null
}

export type ActionCenterOverview = {
  summaries: ActionCenterQueueSummary[]
  /**
   * Informativo, não é fila: avisos aguardando o envio pelo WhatsApp, que só
   * acontece quando a integração com a Meta existir.
   */
  pendingOutboxCount: number
}

/**
 * Resumo agregado da Central de Ação. Cinco consultas limitadas, sem listas
 * de ids nem perfis carregados em memória; o handoff lê no máximo
 * `HANDOFF_OVERVIEW_LIMIT` instantes de início, sem telefone ou nome.
 */
export async function getActionCenterOverview(
  now: Date = new Date(),
  db: ActionCenterDb = prisma,
): Promise<ActionCenterOverview> {
  const cutoffs = getActionCenterCutoffs(now)

  const profileRows = await db.$queryRaw<QueueAggregateRow[]>(Prisma.sql`
    ${profileQueueItemsSql(cutoffs)}
    SELECT
      i."queue",
      COUNT(*)::int AS "count",
      MIN(i."waiting_since") AS "oldest",
      percentile_cont(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM i."waiting_since")
      )::float8 AS "median_epoch",
      BOOL_OR(i."kit_delivery_scheduled_at" <= ${cutoffs.kitVisitOverdue}) AS "has_overdue_visit"
    FROM items i
    GROUP BY i."queue"
  `)

  const failureRows = await db.$queryRaw<QueueAggregateRow[]>(Prisma.sql`
    ${deliveryFailuresSql(cutoffs)}
    SELECT
      'deliveryFailures' AS "queue",
      COUNT(*)::int AS "count",
      MIN(f."occurred_at") AS "oldest",
      percentile_cont(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM f."occurred_at")
      )::float8 AS "median_epoch",
      NULL::boolean AS "has_overdue_visit"
    FROM failures f
  `)

  const handoffCount = await db.whatsappConversation.count({
    where: { step: 'HUMAN_HANDOFF' },
  })
  const handoffStarts = await db.whatsappConversation.findMany({
    where: { step: 'HUMAN_HANDOFF' },
    select: { lastMessageAt: true },
    orderBy: { lastMessageAt: 'asc' },
    take: HANDOFF_OVERVIEW_LIMIT,
  })

  const pendingOutboxCount = await db.notificationOutbox.count({
    where: { status: { in: [...PENDING_OUTBOX_STATUSES] } },
  })

  const byQueue = new Map(
    [...profileRows, ...failureRows].map((row) => [row.queue, row]),
  )

  const calendarSummary = (
    key: ProfileQueueKey | 'deliveryFailures',
  ): ActionCenterQueueSummary => {
    const row = byQueue.get(key)
    return summarizeCalendarQueue({
      key,
      count: row?.count ?? 0,
      oldestSince: row?.oldest ?? null,
      medianWaitMinutes: medianWaitFromEpoch(row?.median_epoch ?? null, now),
      now,
      minimumSeverity:
        key === 'kitNotDelivered' && row?.has_overdue_visit ? 'medium' : null,
    })
  }

  return {
    summaries: [
      summarizeHumanHandoffQueue({
        count: handoffCount,
        pausedSince: handoffStarts.map((row) => row.lastMessageAt),
        now,
      }),
      ...PROFILE_QUEUE_KEYS.map(calendarSummary),
      calendarSummary('deliveryFailures'),
    ],
    pendingOutboxCount,
  }
}

export type ActionCenterPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/** Dados reduzidos da nutriz exibidos no detalhamento. Nunca contato. */
export type ActionCenterNutrizRef = {
  id: string
  fullName: string
  city: string
  state: string
  journeyStatus: JourneyStatusValue
}

type ItemBase = {
  /** Chave técnica estável para a lista; nunca exibida. */
  key: string
  since: Date
  waitMinutes: number
  severity: ActionCenterSeverity
}

export type ActionCenterProfileItem = ItemBase & {
  kind: 'profile'
  nutriz: ActionCenterNutrizRef
  kitDeliveryScheduledAt: Date | null
}

export type ActionCenterHandoffItem = ItemBase & {
  kind: 'handoff'
  /** `null` para conversa de quem ainda não se cadastrou. */
  nutriz: ActionCenterNutrizRef | null
  ignoredMessages: number
}

export type ActionCenterFailureItem = ItemBase & {
  kind: 'failure'
  category: DeliveryFailureCategory
  origin: string
  code: string | null
  linkedNutrizId: string | null
}

export type ActionCenterItem =
  | ActionCenterProfileItem
  | ActionCenterHandoffItem
  | ActionCenterFailureItem

export type ActionCenterQueuePage = {
  key: ActionCenterQueueKey
  items: ActionCenterItem[]
  pagination: ActionCenterPagination
}

function buildPagination(page: number, total: number): ActionCenterPagination {
  const totalPages =
    total === 0 ? 0 : Math.ceil(total / ACTION_CENTER_PAGE_SIZE)
  return {
    page,
    pageSize: ACTION_CENTER_PAGE_SIZE,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  }
}

type ProfileItemRow = {
  id: string
  full_name: string
  city: string
  state: string
  journey_status: JourneyStatusValue
  kit_delivery_scheduled_at: Date | null
  waiting_since: Date
}

async function getProfileQueuePage(
  key: ProfileQueueKey,
  page: number,
  now: Date,
  db: ActionCenterDb,
): Promise<ActionCenterQueuePage> {
  const cutoffs = getActionCenterCutoffs(now)
  const offset = (page - 1) * ACTION_CENTER_PAGE_SIZE

  const [countRow] = await db.$queryRaw<{ total: number }[]>(Prisma.sql`
    ${profileQueueItemsSql(cutoffs)}
    SELECT COUNT(*)::int AS "total" FROM items i WHERE i."queue" = ${key}
  `)

  const rows = await db.$queryRaw<ProfileItemRow[]>(Prisma.sql`
    ${profileQueueItemsSql(cutoffs)}
    SELECT
      np."id",
      np."full_name",
      np."city",
      np."state",
      i."journey_status"::text AS "journey_status",
      i."kit_delivery_scheduled_at",
      i."waiting_since"
    FROM items i
    JOIN "nutriz_profiles" np ON np."id" = i."id"
    WHERE i."queue" = ${key}
    ORDER BY i."waiting_since" ASC, i."id" ASC
    LIMIT ${ACTION_CENTER_PAGE_SIZE} OFFSET ${offset}
  `)

  return {
    key,
    pagination: buildPagination(page, countRow?.total ?? 0),
    items: rows.map((row) => {
      const waitMinutes = calendarWaitMinutes(row.waiting_since, now)
      return {
        kind: 'profile',
        key: row.id,
        since: row.waiting_since,
        waitMinutes,
        severity: getItemSeverity(key, waitMinutes, {
          kitVisitOverdue: isKitVisitOverdue(
            row.kit_delivery_scheduled_at,
            now,
          ),
        }),
        kitDeliveryScheduledAt: row.kit_delivery_scheduled_at,
        nutriz: {
          id: row.id,
          fullName: row.full_name,
          city: row.city,
          state: row.state,
          journeyStatus: row.journey_status,
        },
      }
    }),
  }
}

type HandoffItemRow = {
  id: string
  paused_since: Date
  nutriz_id: string | null
  full_name: string | null
  city: string | null
  state: string | null
  journey_status: JourneyStatusValue | null
  ignored_messages: number
}

async function getHandoffQueuePage(
  page: number,
  now: Date,
  db: ActionCenterDb,
): Promise<ActionCenterQueuePage> {
  const offset = (page - 1) * ACTION_CENTER_PAGE_SIZE
  const total = await db.whatsappConversation.count({
    where: { step: 'HUMAN_HANDOFF' },
  })

  // A espera comercial cresce junto com a corrida, então ordenar pelo início
  // da pausa já é ordenar pela espera, do mais antigo para o mais recente.
  const rows = await db.$queryRaw<HandoffItemRow[]>(Prisma.sql`
    SELECT
      c."id",
      c."last_message_at" AS "paused_since",
      np."id" AS "nutriz_id",
      np."full_name",
      np."city",
      np."state",
      np."journey_status"::text AS "journey_status",
      (
        SELECT COUNT(*)::int
        FROM "whatsapp_inbound_messages" m
        WHERE m."conversation_id" = c."id"
          AND m."processing_result" = 'IGNORED'
          AND m."received_at" > c."last_message_at"
      ) AS "ignored_messages"
    FROM "whatsapp_conversations" c
    LEFT JOIN "nutriz_profiles" np
      ON np."id" = c."nutriz_profile_id" AND np."deleted_at" IS NULL
    WHERE c."step" = 'HUMAN_HANDOFF'
    ORDER BY c."last_message_at" ASC, c."id" ASC
    LIMIT ${ACTION_CENTER_PAGE_SIZE} OFFSET ${offset}
  `)

  return {
    key: 'humanHandoff',
    pagination: buildPagination(page, total),
    items: rows.map((row) => {
      const waitMinutes = businessWaitMinutes(row.paused_since, now)
      return {
        kind: 'handoff',
        key: row.id,
        since: row.paused_since,
        waitMinutes,
        severity: getItemSeverity('humanHandoff', waitMinutes),
        ignoredMessages: row.ignored_messages,
        nutriz:
          row.nutriz_id &&
          row.full_name &&
          row.city &&
          row.state &&
          row.journey_status
            ? {
                id: row.nutriz_id,
                fullName: row.full_name,
                city: row.city,
                state: row.state,
                journeyStatus: row.journey_status,
              }
            : null,
      }
    }),
  }
}

type FailureItemRow = {
  category: DeliveryFailureCategory
  ref_id: string
  origin: string
  code: string | null
  occurred_at: Date
  linked_nutriz_id: string | null
}

async function getFailureQueuePage(
  page: number,
  now: Date,
  db: ActionCenterDb,
): Promise<ActionCenterQueuePage> {
  const cutoffs = getActionCenterCutoffs(now)
  const offset = (page - 1) * ACTION_CENTER_PAGE_SIZE

  const [countRow] = await db.$queryRaw<{ total: number }[]>(Prisma.sql`
    ${deliveryFailuresSql(cutoffs)}
    SELECT COUNT(*)::int AS "total" FROM failures
  `)

  const rows = await db.$queryRaw<FailureItemRow[]>(Prisma.sql`
    ${deliveryFailuresSql(cutoffs)}
    SELECT f."category", f."ref_id", f."origin", f."code", f."occurred_at", f."linked_nutriz_id"
    FROM failures f
    ORDER BY f."occurred_at" ASC, f."ref_id" ASC
    LIMIT ${ACTION_CENTER_PAGE_SIZE} OFFSET ${offset}
  `)

  return {
    key: 'deliveryFailures',
    pagination: buildPagination(page, countRow?.total ?? 0),
    items: rows.map((row) => {
      const waitMinutes = calendarWaitMinutes(row.occurred_at, now)
      return {
        kind: 'failure',
        key: `${row.category}:${row.ref_id}`,
        since: row.occurred_at,
        waitMinutes,
        severity: getItemSeverity('deliveryFailures', waitMinutes),
        category: row.category,
        origin: row.origin,
        code: row.code,
        linkedNutrizId: row.linked_nutriz_id,
      }
    }),
  }
}

/** Página do detalhamento de uma fila, da espera mais longa para a mais curta. */
export async function getActionCenterQueuePage(
  key: ActionCenterQueueKey,
  page: number,
  now: Date = new Date(),
  db: ActionCenterDb = prisma,
): Promise<ActionCenterQueuePage> {
  switch (key) {
    case 'humanHandoff':
      return getHandoffQueuePage(page, now, db)
    case 'deliveryFailures':
      return getFailureQueuePage(page, now, db)
    case 'noProgress':
    case 'kitNotDelivered':
    case 'firstDonation':
    case 'returningDonors':
      return getProfileQueuePage(key, page, now, db)
  }
}
