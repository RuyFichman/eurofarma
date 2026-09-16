import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260916193000_add_reminder_outbox_kind_payload/migration.sql',
  ),
  'utf8',
)

describe('migration da outbox de lembretes', () => {
  it('adiciona o tipo e o payload sem criar modelo de agendamento', () => {
    expect(migrationSql).toContain("ADD VALUE IF NOT EXISTS 'REMINDER'")
    expect(migrationSql).toContain('ADD COLUMN "payload" JSONB')
    expect(migrationSql).toContain('"kind" = \'REMINDER\'')
    expect(migrationSql).not.toMatch(/CREATE TABLE|Appointment|scheduled/iu)
  })
})
