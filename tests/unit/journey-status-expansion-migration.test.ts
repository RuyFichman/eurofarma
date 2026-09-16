import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const valuesMigration = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260916120000_expand_journey_status_values/migration.sql',
  ),
  'utf8',
)
const transitionsMigration = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260916121000_expand_journey_status_transitions/migration.sql',
  ),
  'utf8',
)

describe('migration de ampliação do JourneyStatus', () => {
  it.each([
    'DOCUMENT_SENT',
    'EXAMS_COMPLETED',
    'KIT_SENT',
    'DONATION_CONFIRMED',
  ])('adiciona %s sem recriar ou remover o enum', (status) => {
    expect(valuesMigration).toContain(
      `ALTER TYPE "JourneyStatus" ADD VALUE '${status}'`,
    )
    expect(valuesMigration).not.toMatch(/DROP\s+TYPE/iu)
  })

  it('mantém as transições antigas e aceita os novos marcos', () => {
    expect(transitionsMigration).toContain(
      "\"to_status\" IN ('DOCUMENT_SENT', 'FORM_RECEIVED')",
    )
    expect(transitionsMigration).toContain(
      "\"to_status\" IN ('EXAMS_COMPLETED', 'AWAITING_RESULT')",
    )
    expect(transitionsMigration).toContain(
      "\"to_status\" IN ('KIT_SENT', 'KIT_DELIVERED')",
    )
    expect(transitionsMigration).toContain(
      "'DONATION_CONFIRMED',\n                'RECURRING_DONATION_ELIGIBLE'",
    )
  })
})
