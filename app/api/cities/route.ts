import { NextResponse, type NextRequest } from 'next/server'
import { UnitStatus } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { citySearchParamsSchema } from '@/lib/validators/location'

/**
 * `GET /api/cities?state=SP`
 *
 * Lista as cidades distintas que têm unidades ATIVAS cadastradas na UF
 * informada. Alimenta o select de cidades da busca pública (sprint seguinte).
 *
 * Resposta de sucesso (200): `{ state, cities, count }`, cidades únicas e
 * ordenadas alfabeticamente (pt-BR). UF válida sem unidades → `cities: []`,
 * ainda 200. Erros de entrada → 400 (`MISSING_STATE` / `INVALID_STATE`);
 * falha inesperada → 500 (`INTERNAL_ERROR`), sem vazar detalhes internos.
 *
 * Público, porém só expõe UF + nomes de cidade + contagem — nenhum dado de
 * contato, endereço, id de unidade ou dado pessoal.
 */
export const revalidate = 3600

const SUCCESS_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
} as const

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
} as const

export async function GET(request: NextRequest) {
  const rawState = request.nextUrl.searchParams.get('state')

  // Param ausente (não veio na query) → MISSING_STATE.
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

  // Param presente mas inválido (vazio, UF inexistente, formato errado) → INVALID_STATE.
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

  const { state } = parsed.data

  try {
    const rows = await prisma.unit.findMany({
      where: {
        addressState: state,
        status: UnitStatus.ACTIVE,
        addressCity: { not: '' },
      },
      select: { addressCity: true },
      distinct: ['addressCity'],
      orderBy: { addressCity: 'asc' },
    })

    // Set + trim dedup adicional (variações com espaços) e ordenação com
    // collation pt-BR, garantindo resposta determinística e acentuação correta.
    const cities = Array.from(
      new Set(rows.map((row) => row.addressCity.trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

    return NextResponse.json(
      { state, cities, count: cities.length },
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
          message: 'Não foi possível carregar as cidades agora.',
        },
      },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
