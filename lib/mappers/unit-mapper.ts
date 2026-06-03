import type { Prisma } from '@prisma/client'

import { PRISMA_TO_PUBLIC_UNIT_TYPE } from '../constants/unit-types-prisma'
import type { PublicUnitType } from '../constants/unit-types'

/**
 * Subconjunto de colunas de `Unit` seguras para exposição pública e fonte única
 * do `select` usado no route handler e nas queries. NÃO inclui campos
 * administrativos (`adminNotes`, `adminResponsibleId`), e-mail, instruções,
 * coordenadas, timestamps nem relações.
 */
export const PUBLIC_UNIT_SELECT = {
  id: true,
  slug: true,
  name: true,
  type: true,
  addressNeighborhood: true,
  addressCity: true,
  addressState: true,
  phone: true,
  whatsapp: true,
  whatsappMessage: true,
  openingHours: true,
} satisfies Prisma.UnitSelect

export type UnitSearchResult = Prisma.UnitGetPayload<{
  select: typeof PUBLIC_UNIT_SELECT
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
    hasPhone: boolean
    hasWhatsapp: boolean
  }
  openingHours: Prisma.JsonValue
  /**
   * Mensagem de saudação pré-preenchida no link `wa.me` (campo público
   * `whatsappMessage` da unidade). É voltada à nutriz — não é dado admin/PII.
   */
  whatsappMessage: string | null
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
      hasPhone: Boolean(unit.phone?.trim()),
      hasWhatsapp: Boolean(unit.whatsapp?.trim()),
    },
    openingHours: unit.openingHours,
    whatsappMessage: unit.whatsappMessage,
  }
}
