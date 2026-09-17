import {
  Prisma,
  type JourneyStatus,
  type RegistrationOrigin,
  type ServiceRegion,
} from '@prisma/client'

import type { DashboardFilters } from '../../admin/dashboard/filters'

export type DashboardNutrizScope = {
  stage?: JourneyStatus
  region?: ServiceRegion
  origin?: RegistrationOrigin
  /** Recorte adicional usado por testes e auditorias pontuais, nunca pela URL. */
  profileIds?: string[]
}

const REGISTRATION_ORIGIN_BY_FILTER = {
  whatsapp: 'WHATSAPP',
  web: 'WEB',
  other: 'OTHER',
  unknown: 'UNKNOWN',
} as const satisfies Record<
  Exclude<DashboardFilters['origin'], ''>,
  RegistrationOrigin
>

/**
 * Constrói um recorte compacto para cartões, gráficos e distribuições. Região
 * e origem já são dimensões derivadas pelo banco; nenhum perfil ou dado
 * pessoal precisa ser carregado para montar os filtros.
 */
export function buildDashboardNutrizScope(
  filters: DashboardFilters,
): DashboardNutrizScope {
  return {
    ...(filters.stage ? { stage: filters.stage as JourneyStatus } : {}),
    ...(filters.region ? { region: filters.region as ServiceRegion } : {}),
    ...(filters.origin
      ? { origin: REGISTRATION_ORIGIN_BY_FILTER[filters.origin] }
      : {}),
  }
}

export function toDashboardNutrizWhere(
  scope: DashboardNutrizScope,
): Prisma.NutrizProfileWhereInput {
  return {
    deletedAt: null,
    ...(scope.stage ? { journeyStatus: scope.stage } : {}),
    ...(scope.region ? { dashboardRegion: scope.region } : {}),
    ...(scope.origin ? { registrationOrigin: scope.origin } : {}),
    ...(scope.profileIds ? { id: { in: scope.profileIds } } : {}),
  }
}

/** Fragmento parametrizado usado apenas por agregações SQL do dashboard. */
export function dashboardNutrizSqlWhere(
  scope: DashboardNutrizScope,
): Prisma.Sql {
  const clauses: Prisma.Sql[] = [Prisma.sql`np."deleted_at" IS NULL`]

  if (scope.stage) {
    clauses.push(
      Prisma.sql`np."journey_status" = ${scope.stage}::"JourneyStatus"`,
    )
  }
  if (scope.region) {
    clauses.push(
      Prisma.sql`np."dashboard_region" = ${scope.region}::"ServiceRegion"`,
    )
  }
  if (scope.origin) {
    clauses.push(
      Prisma.sql`np."registration_origin" = ${scope.origin}::"RegistrationOrigin"`,
    )
  }
  if (scope.profileIds) {
    clauses.push(
      scope.profileIds.length === 0
        ? Prisma.sql`FALSE`
        : Prisma.sql`np."id" IN (${Prisma.join(scope.profileIds)})`,
    )
  }

  return Prisma.join(clauses, ' AND ')
}
