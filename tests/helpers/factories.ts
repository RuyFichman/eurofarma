import { randomBytes } from 'node:crypto'
import type { Appointment, NutrizProfile, Prisma, Unit } from '@prisma/client'

import { prisma } from '../../lib/db/prisma'

let counter = 0

/** Sufixo único por contador + bytes aleatórios (evita colisão em testes rápidos). */
function uniqueSuffix(): string {
  counter += 1
  return `${counter}-${randomBytes(4).toString('hex')}`
}

/**
 * Cidade fictícia usada por toda unidade de teste. **É por ela que os testes se
 * isolam** dos dados reais: desde a carga da base da rBLH (Sprint 1.4) as 27 UFs
 * têm unidades, então filtrar só por estado não isola mais nada — mas nenhum
 * município do Brasil se chama "Cidade Teste".
 */
export const TEST_CITY = 'Cidade Teste'

/**
 * Cria uma unidade de teste com defaults sensatos. Todo slug começa com
 * `__test__` para o cleanup do setup conseguir remover, e a cidade é
 * `TEST_CITY` — quem consultar por outra cidade nunca enxerga estes registros.
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
    addressCity: TEST_CITY,
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

/**
 * Cria um cadastro de nutriz de teste. O `fullName` começa com `__test__` —
 * é por esse marcador que o cleanup do `tests/setup.ts` remove a linha, então
 * não sobrescreva o prefixo.
 */
export async function createTestNutrizProfile(
  overrides: Partial<Prisma.NutrizProfileCreateInput> = {},
): Promise<NutrizProfile> {
  const suffix = uniqueSuffix()
  const data: Prisma.NutrizProfileCreateInput = {
    fullName: `__test__ Nutriz ${suffix}`,
    // Número fictício e irreal de propósito: dado de teste nunca deve colidir
    // com um WhatsApp de pessoa real.
    phoneWhatsapp: `5500${suffix.replace(/\D/g, '').padEnd(9, '0').slice(0, 9)}`,
    state: 'TO',
    city: 'Cidade Teste',
    lgpdConsentAt: new Date(),
    ...overrides,
  }
  return prisma.nutrizProfile.create({ data })
}

/**
 * Registra `count` cliques para a mesma unidade em uma única ida ao banco —
 * montar um ranking clique a clique deixaria o teste lento contra o Supabase
 * cloud. A unidade precisa ser de teste (slug `__test__`), senão o cleanup do
 * `tests/setup.ts` não alcança as linhas.
 */
export async function createTestWhatsappClicks(params: {
  unitId: string
  count: number
  createdAt?: Date
}): Promise<number> {
  const { unitId, count, createdAt } = params
  const rows = Array.from({ length: count }, () => ({
    unitId,
    ...(createdAt ? { createdAt } : {}),
  }))
  const result = await prisma.whatsappClick.createMany({ data: rows })
  return result.count
}

/**
 * Cria um agendamento de teste. Nao tem prefixo `__test__` proprio: a linha e
 * alcancada pelo cleanup atraves da nutriz dona dela, entao o `nutrizProfileId`
 * precisa ser de um perfil criado por `createTestNutrizProfile`.
 *
 * `reference` recebe sufixo unico porque a coluna e `@unique` no schema.
 */
export async function createTestAppointment(params: {
  nutrizProfileId: string
  unitId?: string | null
  status?: Prisma.AppointmentCreateInput['status']
  scheduledAt?: Date | null
  failureReason?: Prisma.AppointmentCreateInput['failureReason']
  declaredAt?: Date
}): Promise<Appointment> {
  const suffix = uniqueSuffix()
  return prisma.appointment.create({
    data: {
      reference: `AGD-TEST-${suffix}`,
      nutrizProfile: { connect: { id: params.nutrizProfileId } },
      ...(params.unitId ? { unit: { connect: { id: params.unitId } } } : {}),
      status: params.status ?? 'DECLARED',
      scheduledAt: params.scheduledAt ?? null,
      failureReason: params.failureReason ?? null,
      ...(params.declaredAt ? { declaredAt: params.declaredAt } : {}),
    },
  })
}
