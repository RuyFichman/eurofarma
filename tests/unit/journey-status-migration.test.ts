import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationPath = resolve(
  process.cwd(),
  'prisma/migrations/20260913210000_add_journey_status_model/migration.sql',
)
const migrationSql = readFileSync(migrationPath, 'utf8')

describe('migration do modelo de jornada', () => {
  it('cria enum próprio e status atual sem alterar interestStatus', () => {
    expect(migrationSql).toContain('CREATE TYPE "JourneyStatus" AS ENUM')
    expect(migrationSql).toContain(
      '"journey_status" "JourneyStatus" NOT NULL DEFAULT \'REGISTERED\'',
    )
    expect(migrationSql).not.toMatch(/UPDATE\s+"nutriz_profiles"/iu)
    expect(migrationSql).not.toMatch(/ALTER[^;]+"interest_status"/iu)
  })

  it('vincula cada mudança à nutriz e ao usuário responsável', () => {
    expect(migrationSql).toContain('CREATE TABLE "journey_status_history"')
    expect(migrationSql).toContain(
      'FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")',
    )
    expect(migrationSql).toContain(
      'FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id")',
    )
    expect(migrationSql).toContain(
      '"changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
    )
  })

  it('replica no banco a lista fechada de transições', () => {
    expect(migrationSql).toContain(
      'CONSTRAINT "journey_status_history_valid_transition_check" CHECK',
    )
    expect(migrationSql).toContain(
      "\"from_status\" = 'AWAITING_RESULT'\n            AND \"to_status\" IN ('ELIGIBLE', 'NOT_ELIGIBLE')",
    )
    expect(migrationSql).not.toContain(
      '"from_status" = \'NOT_ELIGIBLE\' AND "to_status"',
    )
  })

  it('impede update e delete do histórico no próprio PostgreSQL', () => {
    expect(migrationSql).toContain(
      'BEFORE UPDATE OR DELETE ON "journey_status_history"',
    )
    expect(migrationSql).toContain(
      'EXECUTE FUNCTION "prevent_journey_status_history_mutation"()',
    )
  })
})
