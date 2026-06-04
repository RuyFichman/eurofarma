import { NextResponse } from 'next/server'

/**
 * Formato padronizado de erro das APIs do projeto: `{ error: { code, message } }`,
 * opcionalmente com `fields` (mensagens seguras por campo, para o frontend).
 * Nunca carrega stack trace, erro do Prisma nem credenciais.
 */
export type ApiErrorBody = {
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const

/** Monta uma resposta JSON de erro (sempre `no-store`). */
export function jsonError(
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string>,
): NextResponse {
  const error: ApiErrorBody['error'] = { code, message }
  if (fields && Object.keys(fields).length > 0) {
    error.fields = fields
  }
  return NextResponse.json({ error } satisfies ApiErrorBody, {
    status,
    headers: NO_STORE_HEADERS,
  })
}
