import { describe, expect, it } from 'vitest'

import {
  EDUCATIONAL_SUGGESTION_IDS,
  getEducationalSuggestionIds,
} from '../../lib/journey/educational-suggestions'
import { JOURNEY_STATUS_VALUES } from '../../lib/journey/status'

describe('sugestões educativas por estágio', () => {
  it('oferece somente sugestões curadas para cada status categórico', () => {
    for (const status of JOURNEY_STATUS_VALUES) {
      const suggestions = getEducationalSuggestionIds(status)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(
        suggestions.every((id) => EDUCATIONAL_SUGGESTION_IDS.includes(id)),
      ).toBe(true)
    }
  })

  it('passa a incluir guias práticos quando a jornada chega à etapa elegível', () => {
    expect(getEducationalSuggestionIds('REGISTERED')).not.toContain(
      'PRACTICAL_GUIDES',
    )
    expect(getEducationalSuggestionIds('ELIGIBLE')).toContain(
      'PRACTICAL_GUIDES',
    )
  })

  it('mantém a sugestão para status não apta sem afirmar motivo clínico', () => {
    expect(getEducationalSuggestionIds('NOT_ELIGIBLE')).toEqual([
      'FAQ',
      'DONATION_PATH',
    ])
  })
})
