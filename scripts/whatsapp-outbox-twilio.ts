import { prisma } from '../lib/db/prisma'
import { processNotificationOutbox } from '../lib/notifications/process-outbox'
import { createTwilioNotificationTransport } from '../lib/notifications/twilio-notification-transport'
import {
  getTwilioStatusCallbackUrl,
  getTwilioWhatsAppProvider,
} from '../lib/whatsapp/twilio-provider'

function parseLimit(): number {
  const index = process.argv.indexOf('--limit')
  const value = Number(index >= 0 ? process.argv[index + 1] : '20')
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error('--limit deve ser um inteiro entre 1 e 100')
  }
  return value
}

async function main(): Promise<void> {
  const summary = await processNotificationOutbox({
    transport: createTwilioNotificationTransport(
      getTwilioWhatsAppProvider(),
      getTwilioStatusCallbackUrl(),
    ),
    limit: parseLimit(),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  })
  console.log(JSON.stringify({ provider: 'twilio', ...summary }))
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Falha na outbox')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
