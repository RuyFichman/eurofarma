/**
 * Tipos de unidade expostos na API pública (snake_case), desacoplados do enum
 * interno do Prisma. O frontend e os contratos REST usam estes valores.
 *
 * Este módulo é **Prisma-free de propósito**: pode ser importado por Client
 * Components sem arrastar `@prisma/client` para o bundle do navegador. A
 * tradução de/para o enum Prisma vive em `./unit-types-prisma` (só servidor).
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
