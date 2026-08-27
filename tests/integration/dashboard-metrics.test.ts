import { describe, it, expect } from 'vitest'

import {
  getAdminDashboardMetrics,
  UNIT_STATUS_KEYS,
  UNIT_TYPE_KEYS,
  type AdminDashboardMetrics,
  type DashboardBreakdown,
} from '../../lib/db/queries/dashboard-metrics'
import {
  createTestNutrizProfile,
  createTestUnit,
  createTestWhatsappClicks,
} from '../helpers/factories'

/**
 * Diferente de `findUnitsByLocation`, estas contagens são **globais** — não dá
 * para isolar por UF. Então cada teste mede um baseline antes de criar os dados
 * e afere o *delta*, o que o mantém correto mesmo com as unidades reais do seed
 * no banco.
 */
function countOf<K extends string>(
  items: DashboardBreakdown<K>[],
  key: K,
): number {
  return items.find((item) => item.key === key)?.count ?? 0
}

function stateCount(
  metrics: AdminDashboardMetrics,
  scope: 'units' | 'nutriz',
  state: string,
): number {
  const rows =
    scope === 'units' ? metrics.units.byState : metrics.nutriz.byState
  return rows.find((row) => row.state === state)?.count ?? 0
}

/** Data confortavelmente fora da janela de 30 dias. */
function longAgo(): Date {
  const date = new Date()
  date.setDate(date.getDate() - 120)
  return date
}

describe('getAdminDashboardMetrics', () => {
  it('expõe todas as situações e tipos, inclusive as zeradas', async () => {
    const metrics = await getAdminDashboardMetrics()

    expect(metrics.units.byStatus.map((row) => row.key)).toEqual([
      ...UNIT_STATUS_KEYS,
    ])
    expect(metrics.units.byType.map((row) => row.key)).toEqual([
      ...UNIT_TYPE_KEYS,
    ])
  })

  it('conta unidades por situação', async () => {
    const before = await getAdminDashboardMetrics()
    await createTestUnit({ status: 'ACTIVE' })
    await createTestUnit({ status: 'PENDING' })
    await createTestUnit({ status: 'INACTIVE' })
    const after = await getAdminDashboardMetrics()

    for (const status of UNIT_STATUS_KEYS) {
      expect(
        countOf(after.units.byStatus, status) -
          countOf(before.units.byStatus, status),
      ).toBe(1)
    }
    expect(after.units.total - before.units.total).toBe(3)
  })

  it('conta unidades por tipo', async () => {
    const before = await getAdminDashboardMetrics()
    await createTestUnit({ type: 'MILK_BANK' })
    await createTestUnit({ type: 'MILK_BANK' })
    await createTestUnit({ type: 'COLLECTION_POINT' })
    const after = await getAdminDashboardMetrics()

    expect(
      countOf(after.units.byType, 'MILK_BANK') -
        countOf(before.units.byType, 'MILK_BANK'),
    ).toBe(2)
    expect(
      countOf(after.units.byType, 'COLLECTION_POINT') -
        countOf(before.units.byType, 'COLLECTION_POINT'),
    ).toBe(1)
  })

  it('conta na cobertura geográfica apenas unidades ativas', async () => {
    const before = await getAdminDashboardMetrics()
    await createTestUnit({ addressState: 'AC', status: 'ACTIVE' })
    await createTestUnit({ addressState: 'AC', status: 'PENDING' })
    await createTestUnit({ addressState: 'AC', status: 'INACTIVE' })
    const after = await getAdminDashboardMetrics()

    expect(
      stateCount(after, 'units', 'AC') - stateCount(before, 'units', 'AC'),
    ).toBe(1)
  })

  it('ordena a cobertura geográfica por volume decrescente', async () => {
    await createTestUnit({ addressState: 'AC' })
    await createTestUnit({ addressState: 'AC' })
    await createTestUnit({ addressState: 'AP' })
    const metrics = await getAdminDashboardMetrics()

    const counts = metrics.units.byState.map((row) => row.count)
    const sorted = [...counts].sort((a, b) => b - a)
    expect(counts).toEqual(sorted)
  })

  it('exclui nutrizes com soft delete da contagem total', async () => {
    const before = await getAdminDashboardMetrics()
    await createTestNutrizProfile()
    await createTestNutrizProfile({ deletedAt: new Date() })
    const after = await getAdminDashboardMetrics()

    expect(after.nutriz.total - before.nutriz.total).toBe(1)
  })

  it('conta no período apenas cadastros dentro da janela', async () => {
    const before = await getAdminDashboardMetrics()
    await createTestNutrizProfile()
    await createTestNutrizProfile({ createdAt: longAgo() })
    const after = await getAdminDashboardMetrics()

    expect(after.nutriz.createdInPeriod - before.nutriz.createdInPeriod).toBe(1)
    // O cadastro antigo continua no total — só ficou fora da janela.
    expect(after.nutriz.total - before.nutriz.total).toBe(2)
  })

  it('agrega nutrizes por UF', async () => {
    const before = await getAdminDashboardMetrics()
    await createTestNutrizProfile({ state: 'AC' })
    await createTestNutrizProfile({ state: 'AC' })
    const after = await getAdminDashboardMetrics()

    expect(
      stateCount(after, 'nutriz', 'AC') - stateCount(before, 'nutriz', 'AC'),
    ).toBe(2)
  })

  it('separa cliques totais dos cliques da janela de 30 dias', async () => {
    const unit = await createTestUnit()
    const before = await getAdminDashboardMetrics()
    await createTestWhatsappClicks({ unitId: unit.id, count: 3 })
    await createTestWhatsappClicks({
      unitId: unit.id,
      count: 2,
      createdAt: longAgo(),
    })
    const after = await getAdminDashboardMetrics()

    expect(after.whatsappClicks.inPeriod - before.whatsappClicks.inPeriod).toBe(
      3,
    )
    expect(after.whatsappClicks.total - before.whatsappClicks.total).toBe(5)
  })

  it('ranqueia as unidades mais contatadas em ordem decrescente', async () => {
    const popular = await createTestUnit({ name: '__test__ Popular' })
    const medium = await createTestUnit({ name: '__test__ Media' })
    const quiet = await createTestUnit({ name: '__test__ Quieta' })

    await createTestWhatsappClicks({ unitId: popular.id, count: 5 })
    await createTestWhatsappClicks({ unitId: medium.id, count: 3 })
    await createTestWhatsappClicks({ unitId: quiet.id, count: 1 })

    const metrics = await getAdminDashboardMetrics()
    const ranking = metrics.whatsappClicks.topUnits

    expect(ranking[0]?.unitId).toBe(popular.id)
    expect(ranking[0]?.clicks).toBe(5)
    expect(ranking[1]?.unitId).toBe(medium.id)
    // Nome e localização vêm resolvidos — a UI não faz consulta extra.
    expect(ranking[0]?.name).toBe('__test__ Popular')
    expect(ranking[0]?.state).toBe('TO')
  })

  it('limita o ranking a 5 unidades', async () => {
    for (let index = 0; index < 6; index += 1) {
      const unit = await createTestUnit()
      await createTestWhatsappClicks({ unitId: unit.id, count: index + 1 })
    }

    const metrics = await getAdminDashboardMetrics()

    expect(metrics.whatsappClicks.topUnits).toHaveLength(5)
  })

  it('ignora cliques fora da janela no ranking', async () => {
    const unit = await createTestUnit()
    await createTestWhatsappClicks({
      unitId: unit.id,
      count: 4,
      createdAt: longAgo(),
    })

    const metrics = await getAdminDashboardMetrics()

    expect(
      metrics.whatsappClicks.topUnits.find((row) => row.unitId === unit.id),
    ).toBeUndefined()
  })
})
