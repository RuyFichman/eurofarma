import { lookupCepAddress } from '../coverage/viacep'
import { getActiveServiceMunicipalityByLocation } from '../db/queries/service-municipalities'
import { coverageCepSchema } from '../validators/coverage'

export type WhatsappCoverageResult =
  | { kind: 'eligible'; city: string; state: string }
  | { kind: 'outside'; city: string | null; state: string | null }
  | { kind: 'invalid' }
  | { kind: 'unavailable' }

type CoverageDependencies = {
  lookupCep: typeof lookupCepAddress
  findMunicipality: typeof getActiveServiceMunicipalityByLocation
}

const DEFAULT_DEPENDENCIES: CoverageDependencies = {
  lookupCep: lookupCepAddress,
  findMunicipality: getActiveServiceMunicipalityByLocation,
}

function isPlausibleMunicipality(value: string): boolean {
  return value.length >= 2 && value.length <= 100 && /\p{L}/u.test(value)
}

/**
 * Resolve CEP ou município para o fluxo do WhatsApp. O CEP existe somente
 * durante esta chamada: o resultado devolve cidade e UF, nunca o CEP.
 */
export async function resolveWhatsappCoverageInput(
  input: string,
  dependencies: CoverageDependencies = DEFAULT_DEPENDENCIES,
): Promise<WhatsappCoverageResult> {
  const value = input.trim()
  if (!value) return { kind: 'invalid' }

  if (/\d/.test(value)) {
    const parsedCep = coverageCepSchema.safeParse(value)
    if (!parsedCep.success) return { kind: 'invalid' }

    const lookup = await dependencies.lookupCep(parsedCep.data)
    if (!lookup.ok) {
      return lookup.reason === 'NOT_FOUND'
        ? { kind: 'invalid' }
        : { kind: 'unavailable' }
    }

    try {
      const municipality = await dependencies.findMunicipality(
        lookup.address.city,
        lookup.address.state,
      )
      return municipality
        ? {
            kind: 'eligible',
            city: municipality.name,
            state: municipality.state,
          }
        : {
            kind: 'outside',
            city: lookup.address.city,
            state: lookup.address.state,
          }
    } catch {
      return { kind: 'unavailable' }
    }
  }

  if (!isPlausibleMunicipality(value)) return { kind: 'invalid' }

  try {
    const municipality = await dependencies.findMunicipality(value, 'SP')
    return municipality
      ? {
          kind: 'eligible',
          city: municipality.name,
          state: municipality.state,
        }
      : { kind: 'outside', city: value, state: null }
  } catch {
    return { kind: 'unavailable' }
  }
}
