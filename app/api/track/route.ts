import { NextResponse } from 'next/server'

/** O tracking por unidade foi encerrado junto com a busca nacional legada. */
export function POST() {
  return NextResponse.json(
    {
      error: {
        code: 'GONE',
        message: 'O tracking por unidade não faz mais parte do fluxo público.',
      },
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}
