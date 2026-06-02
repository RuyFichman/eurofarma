import { UnitType } from '@prisma/client'

import type { PublicUnitType } from './unit-types'

/**
 * Mapas de tradução entre o tipo público (API/UI) e o enum do Prisma.
 *
 * Importa `@prisma/client` — use **apenas em código de servidor** (route
 * handlers, mappers, seeds). Para a UI/Client Components, importe os valores
 * públicos de `./unit-types`, que é Prisma-free.
 */

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
