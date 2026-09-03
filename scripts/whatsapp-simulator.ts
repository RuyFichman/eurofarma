/**
 * Simulador local do webhook do WhatsApp (Sprint 6.5).
 *
 * Monta um payload no formato da Meta, assina com `WHATSAPP_APP_SECRET` e
 * envia para o webhook local. Serve para exercitar a conversa inteira **sem app
 * na Meta, sem número de teste e sem túnel** — e continua útil depois, para
 * reproduzir um caso sem depender de celular na mão.
 *
 * Uso (com o `pnpm dev` rodando):
 *   pnpm whatsapp:sim --from 5511999998888 --text "oi"
 *   pnpm whatsapp:sim --from 5511999998888 --reply agendou_sim
 *   pnpm whatsapp:sim --from 5511999998888 --text "05/06 09:30"
 *   pnpm whatsapp:sim --from 5511999998888 --reply data_ok
 *
 * O bot só responde de verdade se `WHATSAPP_ACCESS_TOKEN` estiver configurado;
 * sem ele o webhook grava normalmente e fica mudo, que é o esperado em local.
 */
import { signWhatsappBody } from '../lib/whatsapp/signature'

type Args = { from: string; text?: string; reply?: string; url: string }

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const get = (flag: string): string | undefined => {
    const index = argv.indexOf(flag)
    return index >= 0 ? argv[index + 1] : undefined
  }

  const from = get('--from')
  if (!from) {
    throw new Error(
      'Informe --from com o numero em digitos (ex.: 5511999998888)',
    )
  }

  const text = get('--text')
  const reply = get('--reply')
  if (!text && !reply) {
    throw new Error('Informe --text "mensagem" ou --reply <id-do-botao>')
  }

  return {
    from,
    text,
    reply,
    url: get('--url') ?? 'http://localhost:3000/api/whatsapp/webhook',
  }
}

function buildPayload(args: Args): Record<string, unknown> {
  const message: Record<string, unknown> = {
    from: args.from,
    id: `wamid.sim.${Date.now()}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  }

  if (args.reply) {
    message.type = 'interactive'
    message.interactive = {
      type: 'button_reply',
      button_reply: { id: args.reply, title: args.reply },
    }
  } else {
    message.type = 'text'
    message.text = { body: args.text }
  }

  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'simulador',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: 'simulador' },
              messages: [message],
            },
          },
        ],
      },
    ],
  }
}

async function main(): Promise<void> {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim()
  if (!appSecret) {
    throw new Error(
      'WHATSAPP_APP_SECRET nao definida em .env.local — o webhook recusa sem assinatura valida.',
    )
  }

  const args = parseArgs()
  const rawBody = JSON.stringify(buildPayload(args))

  const response = await fetch(args.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hub-signature-256': signWhatsappBody(rawBody, appSecret),
    },
    body: rawBody,
  })

  console.log(`${response.status} ${await response.text()}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
