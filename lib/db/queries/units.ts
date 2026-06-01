import type { Prisma, Unit, UnitType } from '@prisma/client'
import { UnitStatus } from '@prisma/client'

import { prisma } from '../prisma'

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
