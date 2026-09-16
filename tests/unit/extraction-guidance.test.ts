import { describe, expect, it } from 'vitest'

import {
  EXTRACTION_CONTACT_SUGGESTION_THRESHOLD_ML,
  shouldShowExtractionContactSuggestion,
} from '../../lib/nutriz/extraction-guidance'

describe('sugestão informativa por volume de extração', () => {
  it('só aparece ao atingir o patamar acumulado configurado', () => {
    expect(
      shouldShowExtractionContactSuggestion(
        EXTRACTION_CONTACT_SUGGESTION_THRESHOLD_ML - 1,
      ),
    ).toBe(false)
    expect(
      shouldShowExtractionContactSuggestion(
        EXTRACTION_CONTACT_SUGGESTION_THRESHOLD_ML,
      ),
    ).toBe(true)
  })

  it('não interpreta valores inválidos como um gatilho operacional', () => {
    expect(shouldShowExtractionContactSuggestion(Number.NaN)).toBe(false)
    expect(
      shouldShowExtractionContactSuggestion(Number.POSITIVE_INFINITY),
    ).toBe(false)
  })
})
