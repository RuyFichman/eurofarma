import { describe, expect, it } from 'vitest'

import { buildJourneyFunnel } from '../../lib/admin/dashboard/journey-funnel'

describe('funil do JourneyStatus', () => {
  it('calcula alcance acumulado, conversao e falta de avanco', () => {
    const funnel = buildJourneyFunnel({
      REGISTERED: 4,
      FORM_RECEIVED: 3,
      EXAM_SCHEDULED: 2,
      AWAITING_RESULT: 1,
      ELIGIBLE: 2,
      NOT_ELIGIBLE: 1,
      KIT_DELIVERED: 1,
      RECURRING_DONATION_ELIGIBLE: 1,
    })

    expect(funnel.steps.map(({ key, reached }) => ({ key, reached }))).toEqual([
      { key: 'REGISTERED', reached: 15 },
      { key: 'FORM_RECEIVED', reached: 11 },
      { key: 'EXAM_SCHEDULED', reached: 8 },
      { key: 'AWAITING_RESULT', reached: 6 },
      { key: 'ELIGIBLE', reached: 4 },
      { key: 'KIT_DELIVERED', reached: 2 },
      { key: 'RECURRING_DONATION_ELIGIBLE', reached: 1 },
    ])
    expect(funnel.overallConversion).toBe(7)
    expect(funnel.dropOffs.map(({ count }) => count)).toEqual([
      4, 3, 2, 1, 2, 1,
    ])
  })

  it('separa nao aptas de abandono e evita divisao por zero', () => {
    const funnel = buildJourneyFunnel({
      REGISTERED: 0,
      FORM_RECEIVED: 0,
      EXAM_SCHEDULED: 0,
      AWAITING_RESULT: 0,
      ELIGIBLE: 0,
      NOT_ELIGIBLE: 2,
      KIT_DELIVERED: 0,
      RECURRING_DONATION_ELIGIBLE: 0,
    })

    const eligibilityDropOff = funnel.dropOffs.find(
      ({ from }) => from === 'AWAITING_RESULT',
    )
    expect(funnel.notEligible).toBe(2)
    expect(eligibilityDropOff).toEqual({
      from: 'AWAITING_RESULT',
      to: 'ELIGIBLE',
      count: 0,
      rate: 0,
    })
    expect(funnel.overallConversion).toBe(0)
  })
})
