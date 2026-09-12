import { NextResponse, type NextRequest } from 'next/server'

import type { CepCoverageResponse } from '../../../lib/coverage/types'
import { lookupCepAddress } from '../../../lib/coverage/viacep'
import { getActiveServiceMunicipalityByLocation } from '../../../lib/db/queries/service-municipalities'
import { COVERAGE } from '../../../lib/i18n/pt-br'
import { getClientIp } from '../../../lib/security/client-ip'
import { rateLimit } from '../../../lib/security/rate-limit'
import { jsonError } from '../../../lib/utils/api-errors'
import { coverageCepRequestSchema } from '../../../lib/validators/coverage'

export const runtime = 'nodejs'

const RATE_LIMIT = { limit: 15, windowMs: 60_000 } as const
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const

export async function POST(request: NextRequest) {
  const limited = rateLimit(
    `coverage:${getClientIp(request.headers)}`,
    RATE_LIMIT,
  )
  if (!limited.success) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: COVERAGE.api.rateLimited,
        },
      },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          'Retry-After': String(limited.retryAfterSeconds),
        },
      },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonError('INVALID_JSON', COVERAGE.api.invalidJson, 400)
  }

  const parsed = coverageCepRequestSchema.safeParse(payload)
  if (!parsed.success) {
    return jsonError('INVALID_CEP', COVERAGE.api.invalidCep, 400, {
      cep: parsed.error.issues[0]?.message ?? COVERAGE.api.invalidCep,
    })
  }

  const lookup = await lookupCepAddress(parsed.data.cep)
  if (!lookup.ok) {
    return lookup.reason === 'NOT_FOUND'
      ? jsonError('CEP_NOT_FOUND', COVERAGE.api.notFound, 404)
      : jsonError('CEP_LOOKUP_UNAVAILABLE', COVERAGE.api.unavailable, 502)
  }

  try {
    const municipality = await getActiveServiceMunicipalityByLocation(
      lookup.address.city,
      lookup.address.state,
    )
    const eligible = municipality !== null

    return NextResponse.json(
      {
        eligible,
        cep: lookup.address.cep,
        location: {
          city: lookup.address.city,
          state: lookup.address.state,
        },
        municipality: municipality
          ? {
              id: municipality.id,
              name: municipality.name,
              region: municipality.region,
            }
          : null,
        residentialCollection: {
          status: eligible ? 'POSSIBLE' : 'OUTSIDE_COVERAGE',
          requiresLactareConfirmation: true,
        },
      } satisfies CepCoverageResponse,
      { status: 200, headers: NO_STORE_HEADERS },
    )
  } catch {
    return jsonError('COVERAGE_UNAVAILABLE', COVERAGE.api.unavailable, 503)
  }
}
