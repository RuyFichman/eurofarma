import { describe, expect, it } from 'vitest'

import { getRecognitionRulesForStatus } from '../../lib/journey/recognitions'

describe('reconhecimentos da jornada', () => {
  it('atribui somente reconhecimentos objetivos do status atual', () => {
    expect(getRecognitionRulesForStatus('DONATION_CONFIRMED')).toEqual([
      { kind: 'FIRST_DONATION', status: 'DONATION_CONFIRMED' },
    ])
    expect(getRecognitionRulesForStatus('RECURRING_DONATION_ELIGIBLE')).toEqual(
      [
        {
          kind: 'CONTINUITY_RECOGNIZED',
          status: 'RECURRING_DONATION_ELIGIBLE',
        },
      ],
    )
  })

  it('não inventa reconhecimento para etapa sem regra', () => {
    expect(getRecognitionRulesForStatus('EXAMS_COMPLETED')).toEqual([])
    expect(getRecognitionRulesForStatus('NOT_ELIGIBLE')).toEqual([])
  })
})
