import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync(
  resolve(
    process.cwd(),
    'prisma/migrations/20260918100000_add_whatsapp_inbound_messages/migration.sql',
  ),
  'utf8',
)

describe('migration de idempotência de mensagens recebidas', () => {
  it('guarda provedor, identificador, conversa, recebimento e resultado', () => {
    expect(migrationSql).toContain('CREATE TABLE "whatsapp_inbound_messages"')
    expect(migrationSql).toContain(
      '"provider" "WhatsappInboundMessageProvider"',
    )
    expect(migrationSql).toContain('"provider_message_id" VARCHAR(255)')
    expect(migrationSql).toContain('"conversation_id" UUID')
    expect(migrationSql).toContain('"received_at" TIMESTAMPTZ')
    expect(migrationSql).toContain(
      '"processing_result" "WhatsappInboundMessageProcessingResult"',
    )
  })

  it('impede reentregas do mesmo provedor e mensagem', () => {
    expect(migrationSql).toContain(
      '"whatsapp_inbound_messages_provider_message_key"',
    )
    expect(migrationSql).toContain('"provider", "provider_message_id"')
  })
})
