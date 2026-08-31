import { describe, it, expect } from 'vitest'

import { adminUnitFormSchema } from '../../lib/admin/units/unit-form-schema'
import { normalizeAdminUnitInput } from '../../lib/admin/units/normalize-unit-input'
import {
  createAdminUnit,
  findAvailableUnitSlug,
  getAdminUnitById,
  updateAdminUnit,
} from '../../lib/db/queries/admin-units'
import { searchPublicUnits } from '../../lib/db/queries/units'
import { prisma } from '../../lib/db/prisma'
import { createTestUnit, TEST_CITY } from '../helpers/factories'

/**
 * Escrita administrativa de unidade contra o banco real (Sprint 5.8).
 *
 * Cobre o caminho que a Server Action percorre depois da autorização:
 * validar → normalizar → gravar. Autorização, `revalidatePath` e `redirect`
 * ficam de fora — dependem do contexto de request do Next.
 *
 * **Isolamento:** todo slug criado aqui começa com `__test__`, que é o marcador
 * que o cleanup de `tests/setup.ts` remove depois de cada teste. Não troque o
 * prefixo, senão o registro fica órfão na base real.
 */

const TEST_SLUG_PREFIX = '__test__mutation'

/** Formulário mínimo válido, na cidade fictícia que isola as consultas públicas. */
const baseForm = {
  name: '__test__ Unidade Mutação',
  type: 'MILK_BANK',
  addressStreet: 'Rua de Teste',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: 'Bairro Teste',
  addressCity: TEST_CITY,
  addressState: 'TO',
  addressZip: '',
  phone: '',
  whatsapp: '',
  email: '',
  openingHours: '',
  instructions: '',
  whatsappMessage: '',
  latitude: '',
  longitude: '',
  status: 'PENDING',
}

/** Busca pública restrita à cidade fictícia — isola dos dados reais da rBLH. */
function publicSearchParams() {
  return {
    state: 'TO',
    city: TEST_CITY,
    neighborhood: null,
    type: null,
    hasWhatsapp: null,
    page: 1,
    limit: 20,
  }
}

function normalized(overrides: Partial<typeof baseForm> = {}) {
  return normalizeAdminUnitInput(
    adminUnitFormSchema.parse({ ...baseForm, ...overrides }),
  )
}

describe('findAvailableUnitSlug', () => {
  it('devolve o próprio base quando está livre', async () => {
    const slug = await findAvailableUnitSlug(`${TEST_SLUG_PREFIX}-livre`)
    expect(slug).toBe(`${TEST_SLUG_PREFIX}-livre`)
  })

  it('acrescenta sufixo quando o base já existe', async () => {
    const base = `${TEST_SLUG_PREFIX}-ocupado`
    await createTestUnit({ slug: base })

    expect(await findAvailableUnitSlug(base)).toBe(`${base}-2`)
  })

  it('pula os sufixos já usados', async () => {
    const base = `${TEST_SLUG_PREFIX}-serie`
    await createTestUnit({ slug: base })
    await createTestUnit({ slug: `${base}-2` })
    await createTestUnit({ slug: `${base}-3` })

    expect(await findAvailableUnitSlug(base)).toBe(`${base}-4`)
  })
})

describe('createAdminUnit', () => {
  it('grava a unidade com os campos normalizados', async () => {
    const slug = `${TEST_SLUG_PREFIX}-completo`
    const { id } = await createAdminUnit({
      slug,
      data: normalized({
        phone: '(63) 3218-1000',
        whatsapp: '(63) 99999-8888',
        email: 'Contato@Unidade.ORG.br',
        addressZip: '77000000',
        openingHours: 'Seg a Sex, 8h às 17h',
        latitude: '-10.24',
        longitude: '-48.35',
      }),
    })

    const saved = await getAdminUnitById(id)

    expect(saved).not.toBeNull()
    expect(saved?.phone).toBe('6332181000')
    expect(saved?.whatsapp).toBe('5563999998888')
    expect(saved?.email).toBe('contato@unidade.org.br')
    expect(saved?.addressZip).toBe('77000-000')
    expect(saved?.openingHours).toBe('Seg a Sex, 8h às 17h')
    expect(saved?.lat).toBe(-10.24)
    expect(saved?.lng).toBe(-48.35)
  })

  it('grava NULL de verdade nos opcionais vazios', async () => {
    const { id } = await createAdminUnit({
      slug: `${TEST_SLUG_PREFIX}-vazios`,
      data: normalized(),
    })

    const saved = await getAdminUnitById(id)

    expect(saved?.phone).toBeNull()
    expect(saved?.whatsapp).toBeNull()
    expect(saved?.addressNumber).toBeNull()
    expect(saved?.lat).toBeNull()
    // Coluna `Json?`: precisa virar SQL NULL, não o JSON `null`.
    expect(saved?.openingHours).toBeNull()
  })

  it('usa a situação escolhida, sem forçar o default do schema', async () => {
    const { id } = await createAdminUnit({
      slug: `${TEST_SLUG_PREFIX}-ativa`,
      data: normalized({ status: 'ACTIVE' }),
    })

    expect((await getAdminUnitById(id))?.status).toBe('ACTIVE')
  })
})

describe('updateAdminUnit', () => {
  it('altera o registro existente em vez de duplicar', async () => {
    const slug = `${TEST_SLUG_PREFIX}-update`
    const created = await createAdminUnit({ slug, data: normalized() })

    const updated = await updateAdminUnit({
      id: created.id,
      data: normalized({ name: '__test__ Unidade Renomeada' }),
    })

    expect(updated.id).toBe(created.id)

    const rows = await prisma.unit.findMany({
      where: { slug: { startsWith: slug } },
      select: { id: true },
    })
    expect(rows).toHaveLength(1)
  })

  it('preserva o slug quando o nome muda — a URL pública não pode quebrar', async () => {
    const slug = `${TEST_SLUG_PREFIX}-slug-estavel`
    const created = await createAdminUnit({ slug, data: normalized() })

    await updateAdminUnit({
      id: created.id,
      data: normalized({
        name: '__test__ Nome Totalmente Diferente',
        addressCity: TEST_CITY,
      }),
    })

    expect((await getAdminUnitById(created.id))?.slug).toBe(slug)
  })

  it('limpa um campo que ficou vazio', async () => {
    const created = await createAdminUnit({
      slug: `${TEST_SLUG_PREFIX}-limpa`,
      data: normalized({ phone: '6332181000' }),
    })

    await updateAdminUnit({ id: created.id, data: normalized({ phone: '' }) })

    expect((await getAdminUnitById(created.id))?.phone).toBeNull()
  })
})

describe('visibilidade pública após a mutação', () => {
  it('unidade ACTIVE aparece na busca pública', async () => {
    await createAdminUnit({
      slug: `${TEST_SLUG_PREFIX}-publica`,
      data: normalized({ status: 'ACTIVE' }),
    })

    const { units } = await searchPublicUnits(publicSearchParams())

    expect(units).toHaveLength(1)
  })

  it.each(['PENDING', 'INACTIVE'] as const)(
    'unidade %s fica fora da busca pública',
    async (status) => {
      await createAdminUnit({
        slug: `${TEST_SLUG_PREFIX}-oculta-${status.toLowerCase()}`,
        data: normalized({ status }),
      })

      const { units } = await searchPublicUnits(publicSearchParams())

      expect(units).toHaveLength(0)
    },
  )
})

describe('getAdminUnitById', () => {
  it('devolve null para id inexistente, sem erro de Prisma', async () => {
    expect(await getAdminUnitById('nao-existe-xyz')).toBeNull()
  })

  it('devolve null para id vazio', async () => {
    expect(await getAdminUnitById('   ')).toBeNull()
  })
})
