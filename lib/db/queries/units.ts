import type { Prisma, Unit, UnitType } from '@prisma/client'
import { UnitStatus } from '@prisma/client'

import { prisma } from '../prisma'
import {
  mapUnitToPublicUnit,
  PUBLIC_UNIT_SELECT,
  type PublicUnit,
} from '../../mappers/unit-mapper'
import { PUBLIC_TO_PRISMA_UNIT_TYPE } from '../../constants/unit-types-prisma'
import type { UnitSearchParams } from '../../validators/unit-search'

export type FindUnitsByLocationParams = {
  state: string
  city?: string
  neighborhood?: string
  hasWhatsapp?: boolean
  type?: UnitType
  limit?: number
  offset?: number
}

export type FindUnitsByLocationResult = {
  units: Unit[]
  total: number
  limit: number
  offset: number
}

/**
 * Busca unidades ATIVAS por localização, para a busca pública.
 * - `state` é normalizado para maiúsculo (aceita `sp` e `SP`).
 * - `city` é comparado case-insensitive (igualdade).
 * - `neighborhood` é busca parcial (contains) case-insensitive.
 * - Retorna também `total` (sem paginação) para a UI mostrar contadores.
 */
export async function findUnitsByLocation(
  params: FindUnitsByLocationParams,
): Promise<FindUnitsByLocationResult> {
  const {
    state,
    city,
    neighborhood,
    hasWhatsapp,
    type,
    limit = 20,
    offset = 0,
  } = params

  const where: Prisma.UnitWhereInput = {
    status: UnitStatus.ACTIVE,
    addressState: state.toUpperCase(),
    ...(city && { addressCity: { equals: city, mode: 'insensitive' } }),
    ...(neighborhood && {
      addressNeighborhood: { contains: neighborhood, mode: 'insensitive' },
    }),
    ...(hasWhatsapp && { whatsapp: { not: null } }),
    ...(type && { type }),
  }

  const [units, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.unit.count({ where }),
  ])

  return { units, total, limit, offset }
}

export type PublicUnitSearchMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type PublicUnitSearchResult = {
  units: PublicUnit[]
  meta: PublicUnitSearchMeta
}

/**
 * Busca pública paginada de unidades ATIVAS, já mapeadas para o formato público
 * (sem campos admin/PII). Fonte única consumida pelo route handler `GET /api/units`
 * e pela página `/buscar` — recebe os filtros já validados por `parseUnitSearchParams`.
 *
 * `state` é igualdade exata (já normalizado); `city` é igualdade case-insensitive;
 * `neighborhood` é busca parcial case-insensitive; `hasWhatsapp=true` exige whatsapp
 * preenchido (não nulo e não vazio). UF válida sem unidades → `units: []` + `total: 0`.
 */
export async function searchPublicUnits(
  params: UnitSearchParams,
): Promise<PublicUnitSearchResult> {
  const { state, city, neighborhood, type, hasWhatsapp, page, limit } = params

  const where: Prisma.UnitWhereInput = {
    status: UnitStatus.ACTIVE,
    addressState: state,
  }

  if (city) {
    where.addressCity = { equals: city, mode: 'insensitive' }
  }

  if (neighborhood) {
    where.addressNeighborhood = { contains: neighborhood, mode: 'insensitive' }
  }

  if (type) {
    where.type = PUBLIC_TO_PRISMA_UNIT_TYPE[type]
  }

  if (hasWhatsapp === true) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      { whatsapp: { not: null } },
      { whatsapp: { not: '' } },
    ]
  }

  const [total, units] = await prisma.$transaction([
    prisma.unit.count({ where }),
    prisma.unit.findMany({
      where,
      select: PUBLIC_UNIT_SELECT,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

  return {
    units: units.map(mapUnitToPublicUnit),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}
