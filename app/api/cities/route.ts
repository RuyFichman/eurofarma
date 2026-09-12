import { NextResponse, type NextRequest } from 'next/server'

import { getActiveServiceMunicipalities } from '@/lib/db/queries/service-municipalities'
import { citySearchParamsSchema } from '@/lib/validators/location'

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const

/**
 * Lista somente municípios ativos da área do Lactare. UFs diferentes de SP
 * retornam lista vazia; a API não consulta nem expõe a base nacional legada.
 */
export async function GET(request: NextRequest) {
  const rawState = request.nextUrl.searchParams.get('state')
  if (rawState === null) {
    return NextResponse.json(
      {
        error: {
          code: 'MISSING_STATE',
          message: 'O parâmetro state é obrigatório.',
        },
      },
      { status: 400, headers: NO_STORE_HEADERS },
    )
  }

  const parsed = citySearchParamsSchema.safeParse({ state: rawState })
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_STATE',
          message: 'Informe uma UF brasileira válida com 2 letras.',
        },
      },
      { status: 400, headers: NO_STORE_HEADERS },
    )
  }

  if (parsed.data.state !== 'SP') {
    return NextResponse.json(
      { state: parsed.data.state, cities: [], count: 0 },
      { status: 200, headers: NO_STORE_HEADERS },
    )
  }

  try {
    const municipalities = await getActiveServiceMunicipalities()
    const cities = municipalities.map((item) => item.name)
    return NextResponse.json(
      { state: 'SP', cities, count: cities.length },
      { status: 200, headers: NO_STORE_HEADERS },
    )
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Não foi possível carregar as cidades agora.',
        },
      },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
