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

const zapiMigrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260919140000_allow_zapi_numeric_reply_options/migration.sql',
  ),
  'utf8',
)

const nutrizCpfMigrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260920040000_add_nutriz_cpf_and_address/migration.sql',
  ),
  'utf8',
)

const stepValuesMigrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260920041000_expand_whatsapp_conversation_step_values/migration.sql',
  ),
  'utf8',
)

const registrationDraftMigrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260920050000_expand_whatsapp_conversation_registration_draft/migration.sql',
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

  it('aceita apenas ids técnicos numerados no contexto da Z-API', () => {
    expect(zapiMigrationSql).toContain('zapiReplyOptionIds')
    expect(zapiMigrationSql).toContain(
      "jsonb_typeof(\"context\" -> 'zapiReplyOptionIds') = 'array'",
    )
    // A lista é validada inteira, no formato em que o jsonb a renderiza:
    // somente ids técnicos, no máximo dez e 64 caracteres cada.
    expect(zapiMigrationSql).toContain(
      '\'^\\["[A-Za-z0-9_-]{1,64}"(, "[A-Za-z0-9_-]{1,64}"){0,9}\\]$\'',
    )
    // Nenhuma outra chave pode entrar no contexto além dessas duas.
    expect(zapiMigrationSql).toContain(
      "(\"context\" - 'location' - 'zapiReplyOptionIds') = '{}'::jsonb",
    )
    expect(zapiMigrationSql).not.toMatch(/phone|full_name|zip|message_body/iu)
  })
})

describe('migração do fluxo consolidado do chatbot (20/09/2026)', () => {
  it('adiciona CPF e endereço a nutriz_profiles, únicos só quando preenchidos', () => {
    expect(nutrizCpfMigrationSql).toContain('ADD COLUMN "cpf" TEXT')
    expect(nutrizCpfMigrationSql).toContain('ADD COLUMN "address" TEXT')
    expect(nutrizCpfMigrationSql).toContain(
      'CREATE UNIQUE INDEX "nutriz_profiles_cpf_key" ON "nutriz_profiles"("cpf")',
    )
    expect(nutrizCpfMigrationSql).not.toMatch(/DROP\s+(COLUMN|TABLE)/iu)
  })

  it('acrescenta os novos estados sem remover nenhum valor existente do enum', () => {
    for (const step of [
      'FAQ_MENU',
      'FAQ_STEPS_MENU',
      'FAQ_STEPS_CLOSING',
      'FAQ_WHO_CLOSING',
      'FAQ_PAIN_CLOSING',
      'FAQ_FREQUENCY_CLOSING',
      'AWAITING_CPF',
      'AWAITING_EMAIL',
      'AWAITING_ADDRESS',
      'POST_REGISTRATION_MENU',
    ]) {
      expect(stepValuesMigrationSql).toContain(`ADD VALUE '${step}'`)
    }
    expect(stepValuesMigrationSql).not.toMatch(/DROP\s+VALUE|'FAQ'\s*;/u)
  })

  it('aceita o rascunho de cadastro no contexto só com o formato certo', () => {
    expect(registrationDraftMigrationSql).toContain("? 'registration'")
    expect(registrationDraftMigrationSql).toContain(
      "- 'fullName' - 'cpf' - 'email' - 'address'",
    )
    // CPF: só formato (11 dígitos) — o dígito verificador é conferido na aplicação.
    expect(registrationDraftMigrationSql).toContain("~ '^[0-9]{11}$'")
    // faqStep: só os quatro IDs internos das etapas de doação.
    expect(registrationDraftMigrationSql).toContain(
      "'HEALTH_FORM', 'KIT', 'EXTRACTION', 'COLLECTION'",
    )
    expect(registrationDraftMigrationSql).not.toMatch(
      /phone|zip|message_body/iu,
    )
  })
})
