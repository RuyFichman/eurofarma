/**
 * Processa a outbox do RF17 sem chamar a Meta e sem imprimir PII ou o corpo da
 * mensagem. Use depois de uma mudança de status feita para uma nutriz com
 * opt-in específico de avisos pelo WhatsApp.
 *
 * pnpm whatsapp:outbox:sim
 * pnpm whatsapp:outbox:sim -- --result retryable --limit 1
 * pnpm whatsapp:outbox:sim -- --result failed --limit 1
 */
import { createHash } from 'node:crypto'

import { prisma } from '../lib/db/prisma'
import type {
  NotificationTransport,
  NotificationTransportResult,
} from '../lib/notifications/journey-status-notification'
import { processNotificationOutbox } from '../lib/notifications/process-outbox'

type SimulatedResult = 'sent' | 'retryable' | 'failed'

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function parseResult(): SimulatedResult {
  const value = getArg('--result') ?? 'sent'
  if (value === 'sent' || value === 'retryable' || value === 'failed') {
    return value
  }
  throw new Error('--result deve ser sent, retryable ou failed')
}

function parseLimit(): number {
  const value = Number(getArg('--limit') ?? '20')
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error('--limit deve ser um inteiro entre 1 e 100')
  }
  return value
}

function simulatedProviderId(idempotencyKey: string): string {
  const digest = createHash('sha256')
    .update(idempotencyKey)
    .digest('hex')
    .slice(0, 24)
  return `sim.${digest}`
}

function simulatorTransport(result: SimulatedResult): NotificationTransport {
  return {
    async send(input): Promise<NotificationTransportResult> {
      if (result === 'retryable') {
        return {
          outcome: 'RETRYABLE_FAILURE',
          errorCode: 'SIMULATED_TEMPORARY_FAILURE',
        }
      }
      if (result === 'failed') {
        return {
          outcome: 'PERMANENT_FAILURE',
          errorCode: 'SIMULATED_PERMANENT_FAILURE',
        }
      }
      return {
        outcome: 'SENT',
        providerMessageId: simulatedProviderId(input.idempotencyKey),
      }
    },
  }
}

async function main(): Promise<void> {
  const result = parseResult()
  const summary = await processNotificationOutbox({
    transport: simulatorTransport(result),
    limit: parseLimit(),
    siteUrl:
      getArg('--site-url') ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000',
  })

  console.log(JSON.stringify({ simulator: result, ...summary }))
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Falha no simulador')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
