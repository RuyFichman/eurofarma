import { describe, expect, it } from 'vitest'

import {
  createReferralCode,
  normalizeReferralCode,
} from '../../lib/referrals/code'

describe('código de indicação', () => {
  it('gera um identificador opaco e URL-safe', () => {
    const code = createReferralCode()

    expect(normalizeReferralCode(code)).toBe(code)
    expect(code).not.toContain(' ')
  })

  it('descarta valores que não foram emitidos pelo NutriLink', () => {
    expect(normalizeReferralCode('utm_source=friend')).toBeNull()
    expect(normalizeReferralCode('nlr_nome-da-nutriz')).toBeNull()
    expect(normalizeReferralCode(null)).toBeNull()
  })
})
