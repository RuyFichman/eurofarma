import { randomBytes } from 'node:crypto'

const REFERRAL_CODE_PREFIX = 'nlr_'
const REFERRAL_CODE_BYTES = 16
const REFERRAL_CODE_PATTERN = /^nlr_[A-Za-z0-9_-]{22}$/

/** Gera um identificador opaco, estável e seguro para compartilhar sem PII. */
export function createReferralCode(): string {
  return `${REFERRAL_CODE_PREFIX}${randomBytes(REFERRAL_CODE_BYTES).toString(
    'base64url',
  )}`
}

/** Descarta códigos que não foram emitidos pelo NutriLink. */
export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const code = value.trim()
  return REFERRAL_CODE_PATTERN.test(code) ? code : null
}
