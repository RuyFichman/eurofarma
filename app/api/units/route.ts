import { NextResponse, type NextRequest } from 'next/server'

import { searchPublicUnits } from '@/lib/db/queries/units'
import { parseUnitSearchParams } from '@/lib/validators/unit-search'

/**
 * `GET /api/units?state=SP&city=...&neighborhood=...&type=...&has_whatsapp=...&page=1&limit=10`
 *
 * Lista paginada de unidades ATIVAS para a busca pública. `state` é obrigatório;
 * os demais filtros são opcionais. Retorna `{ filters, units, meta }`, ordenado
 * por `name` asc. UF válida sem unidades → lista vazia + 200 (nunca 404).
 *
 * Expõe apenas dados públicos (id, slug, nome, tipo, bairro/cidade/UF, telefone,
 * whatsapp, horários). NUNCA retorna adminNotes, adminResponsibleId, e-mail,
 * instruções, coordenadas, timestamps ou dados de nutrizes.
 */
export const revalidate = 300

const SUCCESS_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
} as const

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
} as const

export async function GET(request: NextRequest) {
  const parsed = parseUnitSearchParams(request.nextUrl.searchParams)
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: 400, headers: NO_STORE_HEADERS },
    )
  }

  const { state, city, neighborhood, type, hasWhatsapp } = parsed.data

  try {
    const { units, meta } = await searchPublicUnits(parsed.data)

    return NextResponse.json(
      {
        filters: { state, city, neighborhood, type, hasWhatsapp },
        units,
        meta,
      },
      { status: 200, headers: SUCCESS_HEADERS },
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Não foi possível carregar as unidades agora.',
        },
      },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
