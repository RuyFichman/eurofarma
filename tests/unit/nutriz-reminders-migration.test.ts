import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const kitScheduledAtSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260920060000_add_nutriz_kit_delivery_scheduled_at/migration.sql',
  ),
  'utf8',
)

const preferencesSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260920070000_add_nutriz_reminder_preferences/migration.sql',
  ),
  'utf8',
)

describe('migração "Meus lembretes" (20/09/2026)', () => {
  it('acrescenta a data/horário da entrega do kit como coluna opcional', () => {
    expect(kitScheduledAtSql).toContain(
      'ADD COLUMN "kit_delivery_scheduled_at" TIMESTAMP(3)',
    )
    expect(kitScheduledAtSql).not.toMatch(/NOT NULL/u)
  })

  it('cria os dois enums fechados dos lembretes configuráveis', () => {
    expect(preferencesSql).toContain('CREATE TYPE "NutrizReminderType" AS ENUM')
    expect(preferencesSql).toContain('MILK_VALIDITY')
    expect(preferencesSql).toContain('FUTURE_DONATION')
    expect(preferencesSql).toContain('KIT_DELIVERY')
    expect(preferencesSql).toContain(
      'CREATE TYPE "ReminderTimingOption" AS ENUM',
    )
  })

  it('só permite uma preferência por nutriz e tipo', () => {
    expect(preferencesSql).toContain(
      'CREATE UNIQUE INDEX "nutriz_reminder_preferences_profile_type_key"',
    )
    expect(preferencesSql).toContain(
      'ON "nutriz_reminder_preferences"("nutriz_profile_id", "type")',
    )
  })

  it('o CHECK garante que cada tipo só preenche o campo que faz sentido para ele', () => {
    expect(preferencesSql).toContain(
      'CONSTRAINT "nutriz_reminder_preferences_shape_check" CHECK',
    )
    expect(preferencesSql).toContain(
      '"type" = \'MILK_VALIDITY\'\n            AND "timing_option" IN (\'MILK_1_DAY_BEFORE\', \'MILK_2_DAYS_BEFORE\', \'MILK_3_DAYS_BEFORE\')\n            AND "source_extraction_log_id" IS NOT NULL\n            AND "target_date" IS NULL',
    )
    expect(preferencesSql).toContain(
      '"type" = \'FUTURE_DONATION\'\n            AND "timing_option" IN (\'DONATION_7_DAYS_BEFORE\', \'DONATION_ON_DAY\', \'DONATION_7_DAYS_BEFORE_AND_ON_DAY\')\n            AND "target_date" IS NOT NULL\n            AND "source_extraction_log_id" IS NULL',
    )
    expect(preferencesSql).toContain(
      '"type" = \'KIT_DELIVERY\'\n            AND "timing_option" IN (\'KIT_MORNING_OF\', \'KIT_1_DAY_BEFORE\', \'KIT_1_DAY_BEFORE_AND_ON_DAY\')\n            AND "target_date" IS NULL\n            AND "source_extraction_log_id" IS NULL',
    )
  })

  it('referencia a nutriz e, opcionalmente, a sessão de extração de origem', () => {
    expect(preferencesSql).toContain(
      'FOREIGN KEY ("nutriz_profile_id") REFERENCES "nutriz_profiles"("id")\n    ON DELETE CASCADE',
    )
    expect(preferencesSql).toContain(
      'FOREIGN KEY ("source_extraction_log_id") REFERENCES "extraction_logs"("id")\n    ON DELETE SET NULL',
    )
  })

  it('habilita RLS com policies de propriedade, no mesmo padrão das outras tabelas pessoais', () => {
    expect(preferencesSql).toContain(
      'ALTER TABLE "nutriz_reminder_preferences" ENABLE ROW LEVEL SECURITY',
    )
    for (const action of ['select', 'insert', 'update', 'delete']) {
      expect(preferencesSql).toContain(
        `"nutriz_reminder_preferences_owner_${action}"`,
      )
    }
    expect(preferencesSql).toContain('auth.uid()::text')
  })
})
