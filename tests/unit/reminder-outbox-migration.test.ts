import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const enumMigrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260916193000_add_reminder_outbox_kind/migration.sql',
  ),
  'utf8',
)
const payloadMigrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260916193100_add_reminder_outbox_payload/migration.sql',
  ),
  'utf8',
)

describe('migration da outbox de lembretes', () => {
  it('separa o novo enum do CHECK que usa o valor', () => {
    const enumSql = enumMigrationSql.replace(/--[^\r\n]*(?:\r?\n|$)/gu, '')

    expect(enumMigrationSql).toContain("ADD VALUE IF NOT EXISTS 'REMINDER'")
    expect(enumSql).not.toContain('CHECK')
    expect(payloadMigrationSql).not.toContain('ADD VALUE')
    expect(payloadMigrationSql).toContain('ADD COLUMN "payload" JSONB')
    expect(payloadMigrationSql).toContain('"kind" = \'REMINDER\'')
    expect(payloadMigrationSql).not.toMatch(
      /CREATE TABLE|Appointment|scheduled/iu,
    )
  })
})
