import { describe, expect, it } from 'vitest'

import { isLactareHandoffOpen } from '../../lib/constants/lactare-handoff'

describe('horário do handoff humano do Lactare', () => {
  it('fica aberto de segunda a sábado entre 9h e 18h em São Paulo', () => {
    expect(isLactareHandoffOpen(new Date('2026-09-16T13:00:00.000Z'))).toBe(
      true,
    )
    expect(isLactareHandoffOpen(new Date('2026-09-16T21:00:00.000Z'))).toBe(
      false,
    )
    expect(isLactareHandoffOpen(new Date('2026-09-20T14:00:00.000Z'))).toBe(
      false,
    )
  })
})
