import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260915170000_expand_whatsapp_conversation_flow/migration.sql',
  ),
  'utf8',
)

describe('migration do fluxo conversacional', () => {
  it('adiciona os estados ativos e muda o default para MENU', () => {
    for (const step of [
      'MENU',
      'FAQ',
      'AWAITING_COVERAGE',
      'AWAITING_FULL_NAME',
      'AWAITING_CONSENT',
    ]) {
      expect(migrationSql).toContain(`'${step}'`)
    }
    expect(migrationSql).toContain('ALTER COLUMN "step" SET DEFAULT \'MENU\'')
  })

  it('preserva os valores e a coluna do fluxo legado', () => {
    expect(migrationSql).toContain("'ASKED_SCHEDULED'")
    expect(migrationSql).toContain("'AWAITING_DATE_CONFIRMATION'")
    expect(migrationSql).not.toContain('DROP COLUMN "draft_scheduled_at"')
    expect(migrationSql).not.toMatch(/DELETE\s+FROM/iu)
  })

  it('protege o formato do contexto e o contador', () => {
    expect(migrationSql).toContain(
      'whatsapp_conversations_context_object_check',
    )
    expect(migrationSql).toContain('"misunderstood_count" BETWEEN 0 AND 2')
    expect(migrationSql).toContain('("context" - \'location\')')
    expect(migrationSql).toContain(
      "((\"context\" -> 'location') - 'city' - 'state')",
    )
    expect(migrationSql).toContain("?& ARRAY['city', 'state']")
    expect(migrationSql).toContain("~ '^[A-Z]{2}$'")
  })
})
