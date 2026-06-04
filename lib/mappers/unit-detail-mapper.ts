import type { Prisma } from '@prisma/client'

import { PRISMA_TO_PUBLIC_UNIT_TYPE } from '../constants/unit-types-prisma'
import type { PublicUnitType } from '../constants/unit-types'

/**
 * Colunas de `Unit` seguras para a página pública de detalhes. NÃO inclui campos
 * administrativos (`adminNotes`, `adminResponsibleId`), `status`, timestamps nem
 * relações. Fonte única do `select` usado por `getActiveUnitBySlug`.
 */
export const UNIT_DETAIL_SELECT = {
  id: true,
  slug: true,
  name: true,
  type: true,
  addressStreet: true,
  addressNumber: true,
  addressComplement: true,
  addressNeighborhood: true,
  addressCity: true,
  addressState: true,
  addressZip: true,
  phone: true,
  whatsapp: true,
  email: true,
  openingHours: true,
  instructions: true,
  whatsappMessage: true,
  lat: true,
  lng: true,
} satisfies Prisma.UnitSelect

export type UnitDetailRow = Prisma.UnitGetPayload<{
  select: typeof UNIT_DETAIL_SELECT
}>

export type PublicUnitDetail = {
  id: string
  slug: string
  name: string
  type: PublicUnitType
  address: {
    street: string | null
    number: string | null
    complement: string | null
    neighborhood: string
    city: string
    state: string
    zip: string | null
    fullAddress: string
    summary: string
  }
  contact: {
    phone: string | null
    whatsapp: string | null
    email: string | null
    hasPhone: boolean
    hasWhatsapp: boolean
    hasEmail: boolean
  }
  openingHours: unknown
  instructions: string | null
  whatsappMessage: string | null
  coordinates: {
    lat: number | null
    lng: number | null
  }
}

/** Verdadeiro só quando há conteúdo textual real (ignora vazio/espaços). */
function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/** Endereço resumido `Bairro, Cidade - UF`. */
function buildSummary(
  neighborhood: string,
  city: string,
  state: string,
): string {
  return `${neighborhood}, ${city} - ${state}`
}

/**
 * Endereço completo em uma linha, sem vírgulas duplicadas. Se rua/número não
 * existirem, cai para bairro/cidade/UF. O CEP é tratado à parte (não entra aqui).
 */
function buildFullAddress(row: UnitDetailRow): string {
  const streetLine = [row.addressStreet, row.addressNumber]
    .filter(hasText)
    .join(', ')

  const parts = [
    streetLine,
    row.addressComplement,
    row.addressNeighborhood,
    `${row.addressCity} - ${row.addressState}`,
  ].filter((part): part is string => hasText(part))

  return parts.join(', ')
}

/** Converte a unidade (formato Prisma) para o formato público de detalhes. */
export function mapUnitToPublicUnitDetail(
  row: UnitDetailRow,
): PublicUnitDetail {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: PRISMA_TO_PUBLIC_UNIT_TYPE[row.type],
    address: {
      street: row.addressStreet ?? null,
      number: row.addressNumber ?? null,
      complement: row.addressComplement ?? null,
      neighborhood: row.addressNeighborhood,
      city: row.addressCity,
      state: row.addressState,
      zip: row.addressZip ?? null,
      fullAddress: buildFullAddress(row),
      summary: buildSummary(
        row.addressNeighborhood,
        row.addressCity,
        row.addressState,
      ),
    },
    contact: {
      phone: row.phone ?? null,
      whatsapp: row.whatsapp ?? null,
      email: row.email ?? null,
      hasPhone: hasText(row.phone),
      hasWhatsapp: hasText(row.whatsapp),
      hasEmail: hasText(row.email),
    },
    openingHours: row.openingHours,
    instructions: row.instructions ?? null,
    whatsappMessage: row.whatsappMessage ?? null,
    coordinates: {
      lat: row.lat ?? null,
      lng: row.lng ?? null,
    },
  }
}
