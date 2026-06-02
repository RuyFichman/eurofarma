import type { Prisma } from '@prisma/client'

import { PRISMA_TO_PUBLIC_UNIT_TYPE } from '../constants/unit-types-prisma'
import type { PublicUnitType } from '../constants/unit-types'

/**
 * Subconjunto de colunas de `Unit` seguras para exposição pública. NÃO inclui
 * campos administrativos (`adminNotes`, `adminResponsibleId`), e-mail, instruções,
 * coordenadas, timestamps nem relações.
 */
export type UnitSearchResult = Prisma.UnitGetPayload<{
  select: {
    id: true
    slug: true
    name: true
    type: true
    addressNeighborhood: true
    addressCity: true
    addressState: true
    phone: true
    whatsapp: true
    openingHours: true
  }
}>

export type PublicUnit = {
  id: string
  slug: string
  name: string
  type: PublicUnitType
  address: {
    neighborhood: string
    city: string
    state: string
  }
  contact: {
    phone: string | null
    whatsapp: string | null
    hasWhatsapp: boolean
  }
  openingHours: Prisma.JsonValue
}

/** Converte uma unidade (formato Prisma) para o formato público da API. */
export function mapUnitToPublicUnit(unit: UnitSearchResult): PublicUnit {
  return {
    id: unit.id,
    slug: unit.slug,
    name: unit.name,
    type: PRISMA_TO_PUBLIC_UNIT_TYPE[unit.type],
    address: {
      neighborhood: unit.addressNeighborhood,
      city: unit.addressCity,
      state: unit.addressState,
    },
    contact: {
      phone: unit.phone,
      whatsapp: unit.whatsapp,
      hasWhatsapp: Boolean(unit.whatsapp?.trim()),
    },
    openingHours: unit.openingHours,
  }
}
