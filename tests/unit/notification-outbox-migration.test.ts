import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260916180000_add_notification_outbox/migration.sql',
  ),
  'utf8',
)

describe('migration da outbox do RF17', () => {
  it('cria fila idempotente, tentativas e consentimentos separados', () => {
    expect(migrationSql).toContain('CREATE TABLE "notification_outbox"')
    expect(migrationSql).toContain(
      'CREATE TABLE "notification_delivery_attempts"',
    )
    expect(migrationSql).toContain(
      'CREATE TABLE "communication_consent_events"',
    )
    expect(migrationSql).toContain(
      '"sequence" BIGSERIAL NOT NULL',
    )
    expect(migrationSql).toContain(
      '"communication_consent_events_profile_purpose_sequence_idx"',
    )
    expect(migrationSql).toContain('"notification_outbox_idempotency_key_key"')
    expect(migrationSql).toContain(
      '"notification_delivery_attempts_outbox_attempt_key"',
    )
    expect(migrationSql).toContain(
      'CONSTRAINT "notification_outbox_terminal_state_check"',
    )
    expect(migrationSql).toContain(
      'CONSTRAINT "notification_outbox_error_timestamp_check"',
    )
  })

  it('protege a auditoria de consentimento e tentativas contra mutação', () => {
    expect(migrationSql).toContain(
      'BEFORE UPDATE OR DELETE ON "communication_consent_events"',
    )
    expect(migrationSql).toContain(
      'BEFORE UPDATE OR DELETE ON "notification_delivery_attempts"',
    )
    expect(migrationSql).toContain('BEFORE DELETE ON "notification_outbox"')
  })

  it('não replica telefone, nome nem conteúdo da mensagem na outbox', () => {
    const outboxDefinition = migrationSql.slice(
      migrationSql.indexOf('CREATE TABLE "notification_outbox"'),
      migrationSql.indexOf('CREATE TABLE "notification_delivery_attempts"'),
    )
    expect(outboxDefinition).not.toMatch(
      /phone|whatsapp|full_name|message_body/iu,
    )
  })
})
