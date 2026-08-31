import type { ContactPreference, Prisma } from '@prisma/client'

import { prisma } from '../prisma'
import type {
  AdminNutrizFilters,
  AdminNutrizStatusValue,
} from '../../admin/nutrizes/filters'

/**
 * Listagem administrativa de nutrizes.
 *
 * Espelha `getAdminUnits` (5.6) na mecânica — `select` restrito, `$transaction`
 * com contagem e listagem sob o mesmo `where`, 20 por página — mas com duas
 * diferenças que vêm de estar lidando com **pessoas**, não instituições.
 */

export const ADMIN_NUTRIZES_PAGE_SIZE = 20

/**
 * `select` restrito.
 *
 * `sourceUtm` fica **de fora** de propósito: é dado de origem de campanha, não
 * ajuda quem vai atender a nutriz, e traria parâmetros de rastreamento para uma
 * tela que já expõe PII. `updatedAt` também não entra — nada na tela o usa.
 */
const ADMIN_NUTRIZ_LIST_SELECT = {
  id: true,
  fullName: true,
  phoneWhatsapp: true,
  email: true,
  state: true,
  city: true,
  neighborhood: true,
  interestStatus: true,
  contactPreference: true,
  marketingConsent: true,
  lgpdConsentAt: true,
  createdAt: true,
} as const satisfies Prisma.NutrizProfileSelect

/**
 * Linha da listagem. Enums em união de literais (não o enum do
 * `@prisma/client`) para o DTO poder atravessar até os componentes sem levar o
 * Prisma junto — mesma regra da 5.5/5.6.
 */
export type AdminNutrizListItem = {
  id: string
  fullName: string
  /** Guardado com DDI 55; a UI exibe mascarado até alguém pedir para revelar. */
  phoneWhatsapp: string
  email: string | null
  state: string
  city: string
  neighborhood: string | null
  interestStatus: AdminNutrizStatusValue
  contactPreference: ContactPreference
  marketingConsent: boolean
  lgpdConsentAt: Date
  createdAt: Date
}

export type AdminNutrizesPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type AdminNutrizesResult = {
  nutrizes: AdminNutrizListItem[]
  pagination: AdminNutrizesPagination
}

/**
 * Página de nutrizes cadastradas.
 *
 * **Soft delete é respeitado sempre:** `deletedAt: null` não é filtro opcional,
 * é parte da consulta. Uma nutriz com `deletedAt` preenchido pediu para sair —
 * exibi-la no painel contrariaria a própria exclusão (e o `POST /api/nutriz`
 * limpa `deletedAt` se ela voltar a se cadastrar, então o registro reaparece
 * por decisão dela, não do painel).
 *
 * Ordem `createdAt desc → id`: quem chegou por último aparece primeiro, que é
 * como uma fila de atendimento é lida. O `id` desempata para a paginação ficar
 * estável quando dois cadastros compartilham o mesmo instante.
 */
export async function getAdminNutrizes(
  filters: AdminNutrizFilters,
): Promise<AdminNutrizesResult> {
  const where: Prisma.NutrizProfileWhereInput = { deletedAt: null }

  if (filters.query) {
    where.fullName = { contains: filters.query, mode: 'insensitive' }
  }

  if (filters.status) {
    where.interestStatus = filters.status
  }

  if (filters.state) {
    where.state = filters.state
  }

  const [total, rows] = await prisma.$transaction([
    prisma.nutrizProfile.count({ where }),
    prisma.nutrizProfile.findMany({
      where,
      select: ADMIN_NUTRIZ_LIST_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (filters.page - 1) * ADMIN_NUTRIZES_PAGE_SIZE,
      take: ADMIN_NUTRIZES_PAGE_SIZE,
    }),
  ])

  const totalPages =
    total === 0 ? 0 : Math.ceil(total / ADMIN_NUTRIZES_PAGE_SIZE)

  return {
    nutrizes: rows,
    pagination: {
      page: filters.page,
      pageSize: ADMIN_NUTRIZES_PAGE_SIZE,
      total,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    },
  }
}
