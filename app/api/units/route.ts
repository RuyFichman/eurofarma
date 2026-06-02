import { NextResponse, type NextRequest } from 'next/server'
import { Prisma, UnitStatus } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { parseUnitSearchParams } from '@/lib/validators/unit-search'
import { PUBLIC_TO_PRISMA_UNIT_TYPE } from '@/lib/constants/unit-types-prisma'
import { mapUnitToPublicUnit } from '@/lib/mappers/unit-mapper'

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

  const { state, city, neighborhood, type, hasWhatsapp, page, limit } =
    parsed.data

  try {
    const where: Prisma.UnitWhereInput = {
      status: UnitStatus.ACTIVE,
      addressState: state,
    }

    if (city) {
      // Cidade vem de select no frontend → igualdade case-insensitive.
      where.addressCity = { equals: city, mode: 'insensitive' }
    }

    if (neighborhood) {
      // Bairro é texto livre → busca parcial case-insensitive.
      where.addressNeighborhood = {
        contains: neighborhood,
        mode: 'insensitive',
      }
    }

    if (type) {
      where.type = PUBLIC_TO_PRISMA_UNIT_TYPE[type]
    }

    if (hasWhatsapp === true) {
      // Preserva qualquer AND pré-existente ao exigir whatsapp preenchido.
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        { whatsapp: { not: null } },
        { whatsapp: { not: '' } },
      ]
    }

    const [total, units] = await prisma.$transaction([
      prisma.unit.count({ where }),
      prisma.unit.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          addressNeighborhood: true,
          addressCity: true,
          addressState: true,
          phone: true,
          whatsapp: true,
          openingHours: true,
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

    return NextResponse.json(
      {
        filters: { state, city, neighborhood, type, hasWhatsapp },
        units: units.map(mapUnitToPublicUnit),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
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
