/**
 * Enfileira lembretes de continuidade devidos. O worker da outbox existente
 * faz a entrega; este job não cria agendamento, reserva ou confirmação de
 * coleta. A opção --delay-days existe somente para simulação local.
 *
 * pnpm whatsapp:reminders:job
 * pnpm whatsapp:reminders:job -- --limit 20 --delay-days 2
 */
import { prisma } from '../lib/db/prisma'
import { enqueueDueReminderOutbox } from '../lib/db/queries/reminder-outbox'

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function parseInteger(
  flag: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = Number(getArg(flag) ?? fallback)
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${flag} deve ser um inteiro entre ${min} e ${max}`)
  }
  return value
}

async function main(): Promise<void> {
  const limit = parseInteger('--limit', 100, 1, 100)
  const delayDays = parseInteger('--delay-days', 2, 1, 30)
  const summary = await enqueueDueReminderOutbox({
    limit,
    delayMs: delayDays * 24 * 60 * 60 * 1000,
  })

  console.log(JSON.stringify({ job: 'reminders', delayDays, ...summary }))
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Falha no job')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
