import { z } from 'zod'

import { ACTION_CENTER_RULES } from './thresholds'

/**
 * Filas da Central de Ação. A ordem é a de exibição quando duas filas empatam
 * em criticidade e espera.
 *
 * Ficaram de fora, por decisão de 26/09/2026:
 * - cadastros incompletos no chatbot: o rascunho guarda nome, CPF, e-mail e
 *   endereço **sem consentimento**; contar não leva a nenhuma ação legítima;
 * - consentimentos e exclusões: retiradas já são suprimidas automaticamente
 *   pela outbox e o procedimento de remoção definitiva não está definido.
 */
export const ACTION_CENTER_QUEUE_KEYS = [
  'humanHandoff',
  'noProgress',
  'kitNotDelivered',
  'deliveryFailures',
  'firstDonation',
  'returningDonors',
] as const

export type ActionCenterQueueKey = (typeof ACTION_CENTER_QUEUE_KEYS)[number]

/**
 * Papel responsável por agir. Não existe modelo de atribuição a uma pessoa;
 * o rótulo visível (i18n) deixa claro que é uma equipe, não um nome.
 */
export type ActionCenterOwner = 'service' | 'operations' | 'technical'

export type ActionCenterQueueDefinition = {
  key: ActionCenterQueueKey
  /** Segmento fixo da URL do detalhamento; nunca contém dado pessoal. */
  slug: string
  owner: ActionCenterOwner
}

export const ACTION_CENTER_QUEUES = {
  humanHandoff: {
    key: 'humanHandoff',
    slug: 'atendimento-humano',
    owner: 'service',
  },
  noProgress: { key: 'noProgress', slug: 'sem-avanco', owner: 'operations' },
  kitNotDelivered: {
    key: 'kitNotDelivered',
    slug: 'kit-sem-entrega',
    owner: 'operations',
  },
  deliveryFailures: {
    key: 'deliveryFailures',
    slug: 'falhas-de-envio',
    owner: 'technical',
  },
  firstDonation: {
    key: 'firstDonation',
    slug: 'primeira-doacao',
    owner: 'operations',
  },
  returningDonors: {
    key: 'returningDonors',
    slug: 'doadoras-sem-retorno',
    owner: 'operations',
  },
} as const satisfies Record<ActionCenterQueueKey, ActionCenterQueueDefinition>

const SLUG_TO_KEY = new Map<string, ActionCenterQueueKey>(
  ACTION_CENTER_QUEUE_KEYS.map((key) => [ACTION_CENTER_QUEUES[key].slug, key]),
)

const queueSlugSchema = z
  .string()
  .refine((value) => SLUG_TO_KEY.has(value), { message: 'unknown queue' })

/** Resolve o slug da URL; `null` para qualquer valor fora da lista fixa. */
export function parseActionCenterQueueSlug(
  value: unknown,
): ActionCenterQueueKey | null {
  const parsed = queueSlugSchema.safeParse(value)
  if (!parsed.success) return null
  return SLUG_TO_KEY.get(parsed.data) ?? null
}

const MAX_PAGE = 10_000

const pageSchema = z.coerce.number().int().min(1).max(MAX_PAGE).catch(1)

/** Página do detalhamento; qualquer valor inválido volta para a primeira. */
export function parseActionCenterPage(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value
  return pageSchema.parse(raw ?? 1)
}

export const ACTION_CENTER_BASE_PATH = '/admin/atencao'

export function getActionCenterQueueHref(
  key: ActionCenterQueueKey,
  page = 1,
): string {
  const path = `${ACTION_CENTER_BASE_PATH}/${ACTION_CENTER_QUEUES[key].slug}`
  return page > 1 ? `${path}?page=${page}` : path
}

export const ACTION_CENTER_PAGE_SIZE = ACTION_CENTER_RULES.pageSize
