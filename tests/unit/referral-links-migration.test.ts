import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationPath = resolve(
  process.cwd(),
  'prisma/migrations/20260917090000_add_nutriz_referral_links/migration.sql',
)

describe('migration de links de indicação', () => {
  it('cria link opaco único e atribuição opcional para novos cadastros', () => {
    const sql = readFileSync(migrationPath, 'utf8')

    expect(sql).toContain('CREATE TABLE "referral_links"')
    expect(sql).toContain('"code" TEXT NOT NULL')
    expect(sql).toContain('ADD COLUMN "referred_by_referral_link_id" TEXT')
    expect(sql).toContain('ON DELETE SET NULL ON UPDATE CASCADE')
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY')
  })
})
