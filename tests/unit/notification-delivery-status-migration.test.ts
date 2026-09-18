import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260918110000_add_notification_delivery_status_events/migration.sql',
  ),
  'utf8',
)

describe('migration da auditoria de status de entrega', () => {
  it('cria evento com provedor, MessageSid, estado e vínculo opcional à outbox', () => {
    expect(migrationSql).toContain(
      'CREATE TABLE "notification_delivery_status_events"',
    )
    expect(migrationSql).toContain(
      '"provider_message_id" VARCHAR(255) NOT NULL',
    )
    expect(migrationSql).toContain(
      '"status" "NotificationDeliveryStatus" NOT NULL',
    )
    expect(migrationSql).toContain('"outbox_id" UUID')
  })

  it('protege a auditoria contra update e delete', () => {
    expect(migrationSql).toContain(
      'notification_delivery_status_events are append-only',
    )
    expect(migrationSql).toContain('BEFORE UPDATE OR DELETE')
  })
})
