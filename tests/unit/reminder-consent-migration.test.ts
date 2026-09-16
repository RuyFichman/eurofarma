import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260916190000_add_reminder_consent_purpose/migration.sql',
  ),
  'utf8',
)

describe('migration do consentimento de lembretes', () => {
  it('adiciona somente a finalidade separada ao ledger existente', () => {
    expect(migrationSql).toContain(
      `ADD VALUE IF NOT EXISTS 'REMINDERS_WHATSAPP'`,
    )
    expect(migrationSql).not.toMatch(/CREATE TABLE|Appointment|scheduled/iu)
  })
})
