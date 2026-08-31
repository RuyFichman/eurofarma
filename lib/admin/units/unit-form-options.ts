import {
  ADMIN_UNIT_STATUS_VALUES,
  ADMIN_UNIT_TYPE_VALUES,
  type AdminUnitStatusValue,
  type AdminUnitTypeValue,
} from './filters'
import { getAdminUnitStatusLabel, getAdminUnitTypeLabel } from './labels'

/**
 * Opções dos selects de tipo e situação do formulário (Sprint 5.7).
 *
 * Derivadas das mesmas listas que a URL da listagem usa e rotuladas pelos mesmos
 * `getAdminUnit*Label` da 5.6 — o painel inteiro fala de "Ponto de coleta" e
 * "Pendente" com as mesmas palavras, e um valor novo no enum aparece aqui
 * sozinho (o `switch` exaustivo dos rótulos é que avisa se faltar tradução).
 *
 * Prisma-free: só transita por `filters.ts` (import type-only) e pelo i18n.
 */

export type AdminUnitTypeOption = {
  value: AdminUnitTypeValue
  label: string
}

export type AdminUnitStatusOption = {
  value: AdminUnitStatusValue
  label: string
}

export const ADMIN_UNIT_TYPE_OPTIONS: readonly AdminUnitTypeOption[] =
  ADMIN_UNIT_TYPE_VALUES.map((value) => ({
    value,
    label: getAdminUnitTypeLabel(value),
  }))

/**
 * Ordem intencional: a lista vem de `ADMIN_UNIT_STATUS_VALUES`
 * (ACTIVE, PENDING, INACTIVE), que é a ordem de leitura do painel — não a de
 * declaração do enum no Postgres, usada só para ordenar a listagem.
 */
export const ADMIN_UNIT_STATUS_OPTIONS: readonly AdminUnitStatusOption[] =
  ADMIN_UNIT_STATUS_VALUES.map((value) => ({
    value,
    label: getAdminUnitStatusLabel(value),
  }))
