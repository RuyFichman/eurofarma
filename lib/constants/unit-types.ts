import { UnitType } from '@prisma/client'

/**
 * Tipos de unidade expostos na API pública (snake_case), desacoplados do enum
 * interno do Prisma. O frontend e os contratos REST usam estes valores; a
 * tradução para o enum acontece só na borda (validator/route).
 */
export const PUBLIC_UNIT_TYPES = [
  'milk_bank',
  'collection_point',
  'hospital',
  'partner',
] as const

export type PublicUnitType = (typeof PUBLIC_UNIT_TYPES)[number]

/** Verifica se um valor arbitrário é um tipo público válido. */
export function isPublicUnitType(value: string): value is PublicUnitType {
  return (PUBLIC_UNIT_TYPES as readonly string[]).includes(value)
}

/** Público (API) → enum Prisma. */
export const PUBLIC_TO_PRISMA_UNIT_TYPE = {
  milk_bank: UnitType.MILK_BANK,
  collection_point: UnitType.COLLECTION_POINT,
  hospital: UnitType.HOSPITAL,
  partner: UnitType.PARTNER,
} as const satisfies Record<PublicUnitType, UnitType>

/** Enum Prisma → público (API). */
export const PRISMA_TO_PUBLIC_UNIT_TYPE = {
  [UnitType.MILK_BANK]: 'milk_bank',
  [UnitType.COLLECTION_POINT]: 'collection_point',
  [UnitType.HOSPITAL]: 'hospital',
  [UnitType.PARTNER]: 'partner',
} as const satisfies Record<UnitType, PublicUnitType>
