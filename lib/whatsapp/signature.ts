import { createHmac, timingSafeEqual } from 'node:crypto'

const PREFIX = 'sha256='

/**
 * Confere a assinatura `X-Hub-Signature-256` que a Meta envia em todo webhook.
 *
 * É **a única** barreira do endpoint: sem ela, qualquer um que descubra a URL
 * grava agendamento em nome de terceiros e, pior, descobre se um número está
 * cadastrado. Por isso o handler recusa antes de olhar o corpo.
 *
 * O HMAC é calculado sobre o **corpo cru**, exatamente como chegou — por isso o
 * route handler lê `await request.text()` e só depois faz `JSON.parse`. Um
 * `await request.json()` seguido de `JSON.stringify` mudaria espaços e ordem de
 * chaves, e a assinatura nunca bateria.
 *
 * A comparação usa `timingSafeEqual` para não vazar, pelo tempo de resposta,
 * quantos bytes do digest o atacante já acertou.
 */
export function isValidWhatsappSignature(params: {
  rawBody: string
  signatureHeader: string | null
  appSecret: string
}): boolean {
  const { rawBody, signatureHeader, appSecret } = params

  if (!signatureHeader || !signatureHeader.startsWith(PREFIX)) return false
  if (appSecret.trim() === '') return false

  const received = signatureHeader.slice(PREFIX.length).trim()
  if (!/^[0-9a-f]+$/i.test(received)) return false

  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex')

  const receivedBuffer = Buffer.from(received.toLowerCase(), 'hex')
  const expectedBuffer = Buffer.from(expected, 'hex')

  // `timingSafeEqual` lança quando os tamanhos diferem — comparar antes evita a
  // exceção sem revelar nada além do tamanho, que já é público (SHA-256).
  if (receivedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(receivedBuffer, expectedBuffer)
}

/** Assina um corpo como a Meta assinaria. Usado nos testes e no simulador local. */
export function signWhatsappBody(rawBody: string, appSecret: string): string {
  return `${PREFIX}${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`
}
