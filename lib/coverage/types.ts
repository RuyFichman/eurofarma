import type { ServiceRegionValue } from '../constants/service-municipalities'

export type CepCoverageResponse = {
  eligible: boolean
  cep: string
  location: {
    city: string
    state: string
  }
  municipality: {
    id: string
    name: string
    region: ServiceRegionValue
  } | null
  residentialCollection: {
    status: 'POSSIBLE' | 'OUTSIDE_COVERAGE'
    requiresLactareConfirmation: true
  }
}
