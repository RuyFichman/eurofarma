import type { UnitStatus, UnitType } from '@prisma/client'

import { prisma } from '../prisma'

/**
 * Janela padrão dos indicadores temporais do painel. 30 dias é o recorte que a
 * spec da Sprint 5.5 fixou; não há seletor de período nesta sprint.
 */
export const DASHBOARD_PERIOD_DAYS = 30

/** Quantas unidades aparecem no ranking de mais contatadas. */
const TOP_UNITS_LIMIT = 5

/**
 * Chaves em string literal em vez do enum do `@prisma/client`, na ordem de
 * exibição do painel.
 *
 * Mesma razão do `AdminRole` em `lib/auth/get-admin-user.ts`: o tipo de retorno
 * atravessa até os componentes, e amarrá-lo ao enum faria a UI depender do
 * Prisma. O `satisfies` usa import **type-only** e derruba a compilação se uma
 * chave daqui deixar de existir no schema (renomeada ou removida). Um valor
 * *novo* no enum não é detectado assim — ao mexer nos enums, revisar estas
 * listas.
 */
export const UNIT_STATUS_KEYS = [
  'ACTIVE',
  'PENDING',
  'INACTIVE',
] as const satisfies readonly UnitStatus[]

export const UNIT_TYPE_KEYS = [
  'MILK_BANK',
  'COLLECTION_POINT',
  'HOSPITAL',
  'PARTNER',
] as const satisfies readonly UnitType[]

export type UnitStatusKey = (typeof UNIT_STATUS_KEYS)[number]
export type UnitTypeKey = (typeof UNIT_TYPE_KEYS)[number]

/** Contagem por chave, já na ordem de exibição e incluindo os zeros. */
export type DashboardBreakdown<K extends string> = {
  key: K
  count: number
}

/** Contagem por UF. Nunca por cidade — ver nota de LGPD no cabeçalho da query. */
export type DashboardStateCount = {
  state: string
  count: number
}

export type DashboardTopUnit = {
  unitId: string
  name: string
  city: string
  state: string
  clicks: number
}

export type AdminDashboardMetrics = {
  /** Janela usada nos indicadores temporais, para a UI não precisar adivinhar. */
  periodDays: number
  units: {
    total: number
    byStatus: DashboardBreakdown<UnitStatusKey>[]
    byType: DashboardBreakdown<UnitTypeKey>[]
    byState: DashboardStateCount[]
  }
  nutriz: {
    total: number
    createdInPeriod: number
    byState: DashboardStateCount[]
  }
  whatsappClicks: {
    total: number
    inPeriod: number
    topUnits: DashboardTopUnit[]
  }
}

/** Início da janela, sem mutar a data recebida. */
function subtractDays(from: Date, days: number): Date {
  const result = new Date(from)
  result.setDate(result.getDate() - days)
  return result
}

/**
 * Converte o resultado de um `groupBy` em uma lista na ordem canônica de
 * exibição, preenchendo com zero as chaves que não vieram do banco. Sem isso um
 * status sem nenhuma unidade simplesmente sumiria do painel — e "não existe"
 * lido como "zero" é justamente a leitura que queremos evitar.
 */
function toBreakdown<K extends string>(
  keys: readonly K[],
  rows: { key: string; count: number }[],
): DashboardBreakdown<K>[] {
  const counts = new Map(rows.map((row) => [row.key, row.count]))
  return keys.map((key) => ({ key, count: counts.get(key) ?? 0 }))
}

/**
 * Indicadores do painel administrativo (Sprint 5.5).
 *
 * Tudo é **agregado**: `count`/`groupBy` no banco, nunca linhas carregadas para
 * contar em JS. As contagens independentes vão em um único `$transaction([])`
 * — um round-trip e um retrato consistente do banco.
 *
 * LGPD: a agregação de nutrizes é por **UF, nunca por cidade**. Com um ou dois
 * cadastros em um município, "nutrizes por cidade" reidentifica a pessoa. Nada
 * aqui seleciona nome, telefone ou e-mail, e toda contagem respeita o soft
 * delete (`deletedAt`).
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const since = subtractDays(new Date(), DASHBOARD_PERIOD_DAYS)

  const [
    unitsByStatus,
    unitsByType,
    unitsByState,
    nutrizCreatedInPeriod,
    nutrizByState,
    whatsappClicksTotal,
    whatsappClicksInPeriod,
    topUnitRows,
  ] = await prisma.$transaction([
    prisma.unit.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.unit.groupBy({
      by: ['type'],
      _count: { id: true },
    }),
    // Cobertura geográfica conta apenas unidades ACTIVE: é o que a nutriz
    // realmente encontra na busca pública. Uma UF que só tem unidade pendente
    // não está atendida, e exibi-la como cobertura seria enganoso.
    prisma.unit.groupBy({
      by: ['addressState'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: [{ _count: { id: 'desc' } }, { addressState: 'asc' }],
    }),
    prisma.nutrizProfile.count({
      where: { deletedAt: null, createdAt: { gte: since } },
    }),
    prisma.nutrizProfile.groupBy({
      by: ['state'],
      where: { deletedAt: null },
      _count: { id: true },
      orderBy: [{ _count: { id: 'desc' } }, { state: 'asc' }],
    }),
    prisma.whatsappClick.count(),
    prisma.whatsappClick.count({ where: { createdAt: { gte: since } } }),
    prisma.whatsappClick.groupBy({
      by: ['unitId'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: TOP_UNITS_LIMIT,
    }),
  ])

  // Totais derivados da própria agregação — evita duas consultas que poderiam
  // divergir entre si.
  const unitsTotal = unitsByStatus.reduce((sum, row) => sum + row._count.id, 0)
  const nutrizTotal = nutrizByState.reduce((sum, row) => sum + row._count.id, 0)

  // Nomes das unidades do ranking: uma consulta só para os até 5 ids, não uma
  // por linha (N+1).
  const topUnitIds = topUnitRows.map((row) => row.unitId)
  const topUnitDetails = topUnitIds.length
    ? await prisma.unit.findMany({
        where: { id: { in: topUnitIds } },
        select: {
          id: true,
          name: true,
          addressCity: true,
          addressState: true,
        },
      })
    : []
  const detailsById = new Map(topUnitDetails.map((unit) => [unit.id, unit]))

  const topUnits: DashboardTopUnit[] = topUnitRows.flatMap((row) => {
    const details = detailsById.get(row.unitId)
    // Unidade removida entre as duas consultas: descarta em vez de exibir uma
    // linha sem nome.
    if (!details) return []
    return [
      {
        unitId: row.unitId,
        name: details.name,
        city: details.addressCity,
        state: details.addressState,
        clicks: row._count.id,
      },
    ]
  })

  return {
    periodDays: DASHBOARD_PERIOD_DAYS,
    units: {
      total: unitsTotal,
      byStatus: toBreakdown(
        UNIT_STATUS_KEYS,
        unitsByStatus.map((row) => ({ key: row.status, count: row._count.id })),
      ),
      byType: toBreakdown(
        UNIT_TYPE_KEYS,
        unitsByType.map((row) => ({ key: row.type, count: row._count.id })),
      ),
      byState: unitsByState.map((row) => ({
        state: row.addressState,
        count: row._count.id,
      })),
    },
    nutriz: {
      total: nutrizTotal,
      createdInPeriod: nutrizCreatedInPeriod,
      byState: nutrizByState.map((row) => ({
        state: row.state,
        count: row._count.id,
      })),
    },
    whatsappClicks: {
      total: whatsappClicksTotal,
      inPeriod: whatsappClicksInPeriod,
      topUnits,
    },
  }
}
