import { NextResponse } from 'next/server'

/** Endpoint nacional descontinuado: não expõe mais os registros legados. */
export function GET() {
  return NextResponse.json(
    {
      error: {
        code: 'GONE',
        message:
          'A busca de unidades foi substituída pela área de atuação do Lactare.',
      },
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}
