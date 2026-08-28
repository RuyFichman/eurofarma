import type { Prisma } from '@prisma/client'

import { prisma } from '../prisma'
import type {
  AdminUnitFilters,
  AdminUnitStatusValue,
  AdminUnitTypeValue,
} from '../../admin/units/filters'

/**
 * Tamanho de página fixo da listagem administrativa. Não vai para a URL: quem
 * usa o painel filtra e navega, não escolhe `limit` (diferente da API pública
 * 3.2, que é um contrato REST).
 */
export const ADMIN_UNITS_PAGE_SIZE = 20

/**
 * `select` restrito da listagem — mesma disciplina do `PUBLIC_UNIT_SELECT`:
 * a query traz só o que a tabela desenha. `instructions`, `openingHours`,
 * coordenadas, `adminNotes` e `adminResponsibleId` ficam de fora por não serem
 * usados aqui; `phone`/`whatsapp` entram apenas para virar indicador booleano
 * no DTO (o número em si é assunto da tela de edição, sprint futura).
 */
const ADMIN_UNIT_LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  type: true,
  status: true,
  addressNeighborhood: true,
  addressCity: true,
  addressState: true,
  phone: true,
  whatsapp: true,
} as const satisfies Prisma.UnitSelect

/**
 * Linha da listagem administrativa. Tipos em união de literais (não o enum do
 * `@prisma/client`) pela mesma razão da 5.5: o DTO atravessa até os
 * componentes, e amarrá-lo ao enum faria a UI depender do Prisma.
 */
export type AdminUnitListItem = {
  id: string
  slug: string
  name: string
  type: AdminUnitTypeValue
  status: AdminUnitStatusValue
  neighborhood: string
  city: string
  state: string
  /** Indicadores operacionais: a tabela mostra se o canal existe, não o número. */
  hasPhone: boolean
  hasWhatsapp: boolean
}

export type AdminUnitsPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type AdminUnitsResult = {
  units: AdminUnitListItem[]
  pagination: AdminUnitsPagination
}

/** Canal preenchido de verdade — `''` no banco conta como ausente (mesma regra da busca pública). */
function hasValue(value: string | null): boolean {
  return typeof value === 'string' && value.trim() !== ''
}

/**
 * Listagem paginada de unidades para o painel (Sprint 5.6).
 *
 * Diferente de `searchPublicUnits`, aqui **não** há filtro fixo de status: o
 * admin precisa justamente ver o que está pendente ou inativo. Nada além de
 * `Unit` é consultado — nenhum dado de nutriz entra nesta tela.
 *
 * Filtro e contagem usam o **mesmo `where`** dentro de um `$transaction`: um
 * round-trip e um retrato consistente, sem o total discordar das linhas.
 *
 * Ordenação `status → name → id`. O `id` é o desempate que garante paginação
 * estável (nomes se repetem entre cidades). Em Postgres, `status` ordena pela
 * ordem de declaração do enum no schema (PENDING, ACTIVE, INACTIVE), o que
 * coloca o que aguarda revisão no topo — útil para triagem.
 */
export async function getAdminUnits(
  filters: AdminUnitFilters,
): Promise<AdminUnitsResult> {
  const where: Prisma.UnitWhereInput = {}

  if (filters.query) {
    where.name = { contains: filters.query, mode: 'insensitive' }
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.type) {
    where.type = filters.type
  }

  if (filters.state) {
    where.addressState = filters.state
  }

  if (filters.city) {
    where.addressCity = { contains: filters.city, mode: 'insensitive' }
  }

  const [total, rows] = await prisma.$transaction([
    prisma.unit.count({ where }),
    prisma.unit.findMany({
      where,
      select: ADMIN_UNIT_LIST_SELECT,
      orderBy: [{ status: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      skip: (filters.page - 1) * ADMIN_UNITS_PAGE_SIZE,
      take: ADMIN_UNITS_PAGE_SIZE,
    }),
  ])

  const totalPages = total === 0 ? 0 : Math.ceil(total / ADMIN_UNITS_PAGE_SIZE)

  return {
    units: rows.map((unit) => ({
      id: unit.id,
      slug: unit.slug,
      name: unit.name,
      type: unit.type,
      status: unit.status,
      neighborhood: unit.addressNeighborhood,
      city: unit.addressCity,
      state: unit.addressState,
      hasPhone: hasValue(unit.phone),
      hasWhatsapp: hasValue(unit.whatsapp),
    })),
    pagination: {
      page: filters.page,
      pageSize: ADMIN_UNITS_PAGE_SIZE,
      total,
      totalPages,
      // Página fora do intervalo (ex.: `?page=999`) devolve lista vazia com o
      // total correto — a paginação segue navegável de volta, sem redirect.
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    },
  }
}
