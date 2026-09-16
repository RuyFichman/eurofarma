import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260916200000_add_human_handoff_step/migration.sql',
  ),
  'utf8',
)

describe('migration do handoff humano', () => {
  it('adiciona apenas o estado persistido do handoff', () => {
    expect(migrationSql).toContain("ADD VALUE IF NOT EXISTS 'HUMAN_HANDOFF'")
    expect(migrationSql).not.toMatch(/Appointment|scheduled|CREATE TABLE/iu)
  })
})
