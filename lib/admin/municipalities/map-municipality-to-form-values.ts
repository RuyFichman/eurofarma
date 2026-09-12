import type { AdminMunicipalityFormRecord } from '../../db/queries/service-municipalities'
import type { AdminMunicipalityFormInput } from './municipality-form-schema'

export function mapMunicipalityToFormValues(
  municipality: AdminMunicipalityFormRecord,
): AdminMunicipalityFormInput {
  return {
    name: municipality.name,
    region: municipality.region,
    status: municipality.isActive ? 'ACTIVE' : 'INACTIVE',
  }
}
