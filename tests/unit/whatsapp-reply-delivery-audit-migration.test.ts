import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260919130000_add_zapi_delivery_audit/migration.sql',
  ),
  'utf8',
)

describe('migration de auditoria de entrega Z-API', () => {
  it('adiciona ZAPI ao provedor de status e resultado técnico de resposta', () => {
    expect(migrationSql).toContain(
      'ALTER TYPE "NotificationDeliveryStatusProvider" ADD VALUE IF NOT EXISTS \'ZAPI\'',
    )
    expect(migrationSql).toContain('CREATE TYPE "WhatsappReplyDeliveryOutcome"')
    expect(migrationSql).toContain('"reply_delivery_outcome"')
    expect(migrationSql).toContain('"reply_provider_message_id" VARCHAR(255)')
    expect(migrationSql).toContain('"reply_error_code" VARCHAR(64)')
  })
})
