import { randomBytes } from 'node:crypto'
import type { Prisma, Unit } from '@prisma/client'

import { prisma } from '../../lib/db/prisma'

let counter = 0

/** Sufixo único por contador + bytes aleatórios (evita colisão em testes rápidos). */
function uniqueSuffix(): string {
  counter += 1
  return `${counter}-${randomBytes(4).toString('hex')}`
}

/**
 * Cria uma unidade de teste com defaults sensatos. Todo slug começa com
 * `__test__` para o cleanup do setup conseguir remover. UF default `TO`
 * (estado que o seed não usa) evita colisão com as unidades reais.
 */
export async function createTestUnit(
  overrides: Partial<Prisma.UnitCreateInput> = {},
): Promise<Unit> {
  const suffix = uniqueSuffix()
  const data: Prisma.UnitCreateInput = {
    slug: `__test__unit-${suffix}`,
    name: `__test__ Unidade ${suffix}`,
    type: 'MILK_BANK',
    addressStreet: 'Rua Teste',
    addressNeighborhood: 'Bairro Teste',
    addressCity: 'Cidade Teste',
    addressState: 'TO',
    status: 'ACTIVE',
    ...overrides,
  }
  return prisma.unit.create({ data })
}

/** Cria múltiplas unidades de teste, com overrides opcionais por índice. */
export async function createTestUnits(
  count: number,
  overridesPerIndex?: (index: number) => Partial<Prisma.UnitCreateInput>,
): Promise<Unit[]> {
  const created: Unit[] = []
  for (let index = 0; index < count; index += 1) {
    created.push(await createTestUnit(overridesPerIndex?.(index)))
  }
  return created
}
