import { describe, expect, it } from 'vitest'

import { getAdminDashboardMetrics } from '../../lib/db/queries/dashboard-metrics'
import { buildDashboardNutrizScope } from '../../lib/db/queries/dashboard-segmentation'
import { createTestNutrizProfile } from '../helpers/factories'

describe('segmentação combinável do dashboard', () => {
  it('cruza sub-região, estágio e origem no mesmo conjunto de nutrizes', async () => {
    const matching = await createTestNutrizProfile({
      state: 'SP',
      city: 'Itapevi',
      journeyStatus: 'KIT_DELIVERED',
      sourceUtm: { utm_source: 'whatsapp' },
    })
    const otherRegion = await createTestNutrizProfile({
      state: 'SP',
      city: 'Santo André',
      journeyStatus: 'KIT_DELIVERED',
      sourceUtm: { utm_source: 'whatsapp' },
    })
    const otherStage = await createTestNutrizProfile({
      state: 'SP',
      city: 'Itapevi',
      journeyStatus: 'FORM_RECEIVED',
      sourceUtm: { utm_source: 'whatsapp' },
    })
    const otherOrigin = await createTestNutrizProfile({
      state: 'SP',
      city: 'Itapevi',
      journeyStatus: 'KIT_DELIVERED',
      sourceUtm: { utm_source: 'site' },
    })

    const filteredScope = await buildDashboardNutrizScope({
      region: 'WEST',
      stage: 'KIT_DELIVERED',
      origin: 'whatsapp',
    })
    const fixtureIds = [
      matching.id,
      otherRegion.id,
      otherStage.id,
      otherOrigin.id,
    ]
    const metrics = await getAdminDashboardMetrics({
      ...filteredScope,
      profileIds: fixtureIds,
    })

    expect(metrics.nutriz.total).toBe(1)
    expect(
      metrics.nutriz.byRegion.find((item) => item.key === 'WEST')?.count,
    ).toBe(1)
    expect(
      metrics.nutriz.byStage.find((item) => item.key === 'KIT_DELIVERED')
        ?.count,
    ).toBe(1)
  })
})
