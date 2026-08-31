// Import de valor (não `import type`): `Prisma.DbNull` é usado em runtime para
// apagar a coluna `Json?`. Este módulo é server-only — nenhum Client Component
// o alcança, só Server Components e as Server Actions.
import { Prisma } from '@prisma/client'

import { prisma } from '../prisma'
import type {
  AdminUnitFilters,
  AdminUnitStatusValue,
  AdminUnitTypeValue,
} from '../../admin/units/filters'
import type { NormalizedAdminUnitInput } from '../../admin/units/normalize-unit-input'
import { generateSlugWithSuffix } from '../../utils/slug'

/**
 * Tamanho de página fixo da listagem administrativa. Não vai para a URL: quem
 * usa o painel filtra e navega, não escolhe `limit` (diferente da API pública
 * 3.2, que é um contrato REST).
 */
export const ADMIN_UNITS_PAGE_SIZE = 20

/**
 * `select` restrito da listagem — mesma disciplina do `PUBLIC_UNIT_SELECT`:
 * a query traz só o que a tabela desenha. `instructions`, `openingHours`,
 * coordenadas, `adminNotes` e `adminResponsibleId` ficam de fora por não serem
 * usados aqui; `phone`/`whatsapp` entram apenas para virar indicador booleano
 * no DTO (o número em si é assunto da tela de edição, sprint futura).
 */
const ADMIN_UNIT_LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  type: true,
  status: true,
  addressNeighborhood: true,
  addressCity: true,
  addressState: true,
  phone: true,
  whatsapp: true,
} as const satisfies Prisma.UnitSelect

/**
 * Linha da listagem administrativa. Tipos em união de literais (não o enum do
 * `@prisma/client`) pela mesma razão da 5.5: o DTO atravessa até os
 * componentes, e amarrá-lo ao enum faria a UI depender do Prisma.
 */
export type AdminUnitListItem = {
  id: string
  slug: string
  name: string
  type: AdminUnitTypeValue
  status: AdminUnitStatusValue
  neighborhood: string
  city: string
  state: string
  /** Indicadores operacionais: a tabela mostra se o canal existe, não o número. */
  hasPhone: boolean
  hasWhatsapp: boolean
}

export type AdminUnitsPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type AdminUnitsResult = {
  units: AdminUnitListItem[]
  pagination: AdminUnitsPagination
}

/**
 * `select` da tela de edição (Sprint 5.7). Mais largo que o da listagem porque
 * o formulário edita o registro inteiro — mas ainda restrito: `adminNotes`,
 * `adminResponsibleId` e os timestamps ficam de fora por não serem editáveis, e
 * nenhuma relação (cliques, intenções de contato, nutrizes) é carregada.
 */
const ADMIN_UNIT_FORM_SELECT = {
  id: true,
  slug: true,
  name: true,
  type: true,
  status: true,
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
} as const satisfies Prisma.UnitSelect

/**
 * Unidade como o formulário administrativo precisa dela. Enums em união de
 * literais (mesma razão do `AdminUnitListItem`): o registro atravessa até o
 * mapper e o Client Component, e amarrá-lo ao enum do Prisma levaria o cliente
 * junto.
 */
export type AdminUnitFormRecord = {
  id: string
  slug: string
  name: string
  type: AdminUnitTypeValue
  status: AdminUnitStatusValue
  addressStreet: string
  addressNumber: string | null
  addressComplement: string | null
  addressNeighborhood: string
  addressCity: string
  addressState: string
  addressZip: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  /** `Json?` no schema; nos dados atuais é sempre nulo ou texto simples. */
  openingHours: Prisma.JsonValue
  instructions: string | null
  whatsappMessage: string | null
  lat: number | null
  lng: number | null
}

/**
 * Busca uma unidade por `id` para a tela de edição (Sprint 5.7).
 *
 * `id` é coluna `text` no Postgres, então identificador malformado simplesmente
 * não casa e volta `null` — quem chama transforma isso em `notFound()`, sem
 * erro de Prisma vazando para a tela. Leitura pura: esta função nunca escreve.
 */
export async function getAdminUnitById(
  id: string,
): Promise<AdminUnitFormRecord | null> {
  const trimmed = id.trim()
  if (trimmed === '') return null

  return prisma.unit.findUnique({
    where: { id: trimmed },
    select: ADMIN_UNIT_FORM_SELECT,
  })
}

/** Teto de sufixos testados antes de desistir e reportar conflito. */
const MAX_SLUG_ATTEMPTS = 100

/**
 * Primeiro slug livre a partir de um base (Sprint 5.8).
 *
 * Uma consulta só: traz os slugs que começam pelo base e escolhe o sufixo livre
 * em memória, em vez de bater no banco a cada tentativa. `null` quando os 100
 * primeiros estão ocupados — quem chama transforma isso em conflito controlado.
 *
 * Continua havendo janela de corrida entre a checagem e o insert; quem fecha
 * essa porta é o `@unique` do slug, tratado como P2002 na action.
 */
export async function findAvailableUnitSlug(
  base: string,
): Promise<string | null> {
  const taken = await prisma.unit.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  })
  const takenSlugs = new Set(taken.map((unit) => unit.slug))

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidate = generateSlugWithSuffix(base, attempt)
    if (!takenSlugs.has(candidate)) return candidate
  }

  return null
}

/**
 * Colunas que uma mutação administrativa pode escrever.
 *
 * Esta lista **é** a proteção contra mass assignment: `id`, `slug`, os
 * timestamps, `adminNotes` e `adminResponsibleId` não estão aqui e por isso não
 * há caminho pelo qual o formulário os altere, mesmo que apareçam no payload.
 *
 * `openingHours` é `Json?`: apagar exige `Prisma.DbNull` — `null` cru não
 * tipa, e `Prisma.JsonNull` gravaria o JSON `null` no lugar de SQL NULL.
 */
function toUnitWriteData(
  data: NormalizedAdminUnitInput,
): Omit<Prisma.UnitUncheckedCreateInput, 'slug'> {
  return {
    name: data.name,
    type: data.type,
    status: data.status,
    addressStreet: data.addressStreet,
    addressNumber: data.addressNumber,
    addressComplement: data.addressComplement,
    addressNeighborhood: data.addressNeighborhood,
    addressCity: data.addressCity,
    addressState: data.addressState,
    addressZip: data.addressZip,
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    openingHours: data.openingHours ?? Prisma.DbNull,
    instructions: data.instructions,
    whatsappMessage: data.whatsappMessage,
    lat: data.lat,
    lng: data.lng,
  }
}

/** Cadastra a unidade. Devolve só o `id` — nenhum registro completo volta ao cliente. */
export async function createAdminUnit(params: {
  data: NormalizedAdminUnitInput
  slug: string
}): Promise<{ id: string }> {
  return prisma.unit.create({
    data: { ...toUnitWriteData(params.data), slug: params.slug },
    select: { id: true },
  })
}

/**
 * Atualiza a unidade. **O slug não entra no update**: ele é a URL pública
 * (`/banco-de-leite/[slug]`) e mudá-lo quebraria links já divulgados.
 */
export async function updateAdminUnit(params: {
  id: string
  data: NormalizedAdminUnitInput
}): Promise<{ id: string }> {
  return prisma.unit.update({
    where: { id: params.id },
    data: toUnitWriteData(params.data),
    select: { id: true },
  })
}

/** Canal preenchido de verdade — `''` no banco conta como ausente (mesma regra da busca pública). */
function hasValue(value: string | null): boolean {
  return typeof value === 'string' && value.trim() !== ''
}

/**
 * Listagem paginada de unidades para o painel (Sprint 5.6).
 *
 * Diferente de `searchPublicUnits`, aqui **não** há filtro fixo de status: o
 * admin precisa justamente ver o que está pendente ou inativo. Nada além de
 * `Unit` é consultado — nenhum dado de nutriz entra nesta tela.
 *
 * Filtro e contagem usam o **mesmo `where`** dentro de um `$transaction`: um
 * round-trip e um retrato consistente, sem o total discordar das linhas.
 *
 * Ordenação `status → name → id`. O `id` é o desempate que garante paginação
 * estável (nomes se repetem entre cidades). Em Postgres, `status` ordena pela
 * ordem de declaração do enum no schema (PENDING, ACTIVE, INACTIVE), o que
 * coloca o que aguarda revisão no topo — útil para triagem.
 */
export async function getAdminUnits(
  filters: AdminUnitFilters,
): Promise<AdminUnitsResult> {
  const where: Prisma.UnitWhereInput = {}

  if (filters.query) {
    where.name = { contains: filters.query, mode: 'insensitive' }
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.type) {
    where.type = filters.type
  }

  if (filters.state) {
    where.addressState = filters.state
  }

  if (filters.city) {
    where.addressCity = { contains: filters.city, mode: 'insensitive' }
  }

  const [total, rows] = await prisma.$transaction([
    prisma.unit.count({ where }),
    prisma.unit.findMany({
      where,
      select: ADMIN_UNIT_LIST_SELECT,
      orderBy: [{ status: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      skip: (filters.page - 1) * ADMIN_UNITS_PAGE_SIZE,
      take: ADMIN_UNITS_PAGE_SIZE,
    }),
  ])

  const totalPages = total === 0 ? 0 : Math.ceil(total / ADMIN_UNITS_PAGE_SIZE)

  return {
    units: rows.map((unit) => ({
      id: unit.id,
      slug: unit.slug,
      name: unit.name,
      type: unit.type,
      status: unit.status,
      neighborhood: unit.addressNeighborhood,
      city: unit.addressCity,
      state: unit.addressState,
      hasPhone: hasValue(unit.phone),
      hasWhatsapp: hasValue(unit.whatsapp),
    })),
    pagination: {
      page: filters.page,
      pageSize: ADMIN_UNITS_PAGE_SIZE,
      total,
      totalPages,
      // Página fora do intervalo (ex.: `?page=999`) devolve lista vazia com o
      // total correto — a paginação segue navegável de volta, sem redirect.
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    },
  }
}
