import type { InterestStatus, Prisma, ServiceRegion } from '@prisma/client'

import {
  buildDashboardLocationKey,
  type DashboardFilters,
} from '../../admin/dashboard/filters'
import { getRegistrationOrigin } from '../../admin/dashboard/charts'
import { prisma } from '../prisma'

export type DashboardNutrizScope = Prisma.NutrizProfileWhereInput

/**
 * Constrói o mesmo recorte de nutrizes para cartões, gráficos e distribuições.
 * Região e origem exigem normalização (acentos da cidade e categorias da UTM).
 * Resolvemos somente os ids correspondentes e depois aplicamos esse conjunto
 * às agregações do Prisma, sem carregar nomes ou contatos pessoais.
 */
export async function buildDashboardNutrizScope(
  filters: DashboardFilters,
): Promise<DashboardNutrizScope> {
  const where: DashboardNutrizScope = { deletedAt: null }

  if (filters.stage) {
    where.interestStatus = filters.stage as InterestStatus
  }

  let regionLocations: Set<string> | undefined

  if (filters.region) {
    const municipalities = await prisma.serviceMunicipality.findMany({
      where: { region: filters.region as ServiceRegion },
      select: { name: true, state: true },
    })

    if (municipalities.length === 0) {
      return { deletedAt: null, id: { in: [] } }
    }

    regionLocations = new Set(
      municipalities.map((municipality) =>
        buildDashboardLocationKey(municipality.state, municipality.name),
      ),
    )
  }

  if (!filters.region && !filters.origin) return where

  const candidates = await prisma.nutrizProfile.findMany({
    where,
    select: { id: true, state: true, city: true, sourceUtm: true },
  })
  const matchingIds = candidates
    .filter(
      (candidate) =>
        (!regionLocations ||
          regionLocations.has(
            buildDashboardLocationKey(candidate.state, candidate.city),
          )) &&
        (!filters.origin ||
          getRegistrationOrigin(candidate.sourceUtm) === filters.origin),
    )
    .map((candidate) => candidate.id)

  return { AND: [where, { id: { in: matchingIds } }] }
}
