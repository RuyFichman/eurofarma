import { ADMIN } from '../../i18n/pt-br'
import type { AdminUnitStatusValue, AdminUnitTypeValue } from './filters'

/**
 * Rótulos em pt-br dos enums de unidade na área administrativa.
 *
 * `switch` exaustivo em vez de indexar o objeto de copy: se um valor novo
 * entrar no enum do schema, o compilador aponta aqui em vez de a tela exibir
 * `undefined` em silêncio. Sem `as any` para "resolver" o índice (Princípio 1).
 */

const COPY = ADMIN.units

export function getAdminUnitStatusLabel(status: AdminUnitStatusValue): string {
  switch (status) {
    case 'ACTIVE':
      return COPY.status.ACTIVE
    case 'PENDING':
      return COPY.status.PENDING
    case 'INACTIVE':
      return COPY.status.INACTIVE
  }
}

export function getAdminUnitTypeLabel(type: AdminUnitTypeValue): string {
  switch (type) {
    case 'MILK_BANK':
      return COPY.types.MILK_BANK
    case 'COLLECTION_POINT':
      return COPY.types.COLLECTION_POINT
    case 'HOSPITAL':
      return COPY.types.HOSPITAL
    case 'PARTNER':
      return COPY.types.PARTNER
  }
}
