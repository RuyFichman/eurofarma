import { Prisma, type ServiceRegion } from '@prisma/client'

import type { AdminMunicipalityFilters } from '../../admin/municipalities/filters'
import { ADMIN_MUNICIPALITIES_PAGE_SIZE } from '../../admin/municipalities/filters'
import type { AdminMunicipalityFormValues } from '../../admin/municipalities/municipality-form-schema'
import type { ServiceRegionValue } from '../../constants/service-municipalities'
import { prisma } from '../prisma'
import { generateSlugWithSuffix } from '../../utils/slug'

const PUBLIC_MUNICIPALITY_SELECT = {
  id: true,
  slug: true,
  name: true,
  state: true,
  country: true,
  region: true,
} as const satisfies Prisma.ServiceMunicipalitySelect

const ADMIN_MUNICIPALITY_LIST_SELECT = {
  ...PUBLIC_MUNICIPALITY_SELECT,
  isActive: true,
  updatedAt: true,
} as const satisfies Prisma.ServiceMunicipalitySelect

export type PublicServiceMunicipality = {
  id: string
  slug: string
  name: string
  state: string
  country: string
  region: ServiceRegionValue
}

export type AdminMunicipalityListItem = PublicServiceMunicipality & {
  isActive: boolean
  updatedAt: Date
}

export type AdminMunicipalityFormRecord = AdminMunicipalityListItem

export type AdminMunicipalitiesPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type PublicCoverageStats = {
  activeMunicipalities: number
  regionsCovered: number
}

export async function getActiveServiceMunicipalities(): Promise<
  PublicServiceMunicipality[]
> {
  const municipalities = await prisma.serviceMunicipality.findMany({
    where: { isActive: true },
    select: PUBLIC_MUNICIPALITY_SELECT,
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  })

  return municipalities.sort((left, right) =>
    left.name.localeCompare(right.name, 'pt-BR'),
  )
}

export async function getPublicCoverageStats(): Promise<PublicCoverageStats> {
  const [activeMunicipalities, regions] = await prisma.$transaction([
    prisma.serviceMunicipality.count({ where: { isActive: true } }),
    prisma.serviceMunicipality.groupBy({
      by: ['region'],
      where: { isActive: true },
      _count: { id: true },
    }),
  ])

  return { activeMunicipalities, regionsCovered: regions.length }
}

export async function getAdminMunicipalities(
  filters: AdminMunicipalityFilters,
) {
  const where: Prisma.ServiceMunicipalityWhereInput = {}

  if (filters.query) {
    where.name = { contains: filters.query, mode: 'insensitive' }
  }
  if (filters.status) {
    where.isActive = filters.status === 'ACTIVE'
  }
  if (filters.region) {
    where.region = filters.region as ServiceRegion
  }

  const [total, municipalities] = await prisma.$transaction([
    prisma.serviceMunicipality.count({ where }),
    prisma.serviceMunicipality.findMany({
      where,
      select: ADMIN_MUNICIPALITY_LIST_SELECT,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }, { id: 'asc' }],
      skip: (filters.page - 1) * ADMIN_MUNICIPALITIES_PAGE_SIZE,
      take: ADMIN_MUNICIPALITIES_PAGE_SIZE,
    }),
  ])
  const totalPages =
    total === 0 ? 0 : Math.ceil(total / ADMIN_MUNICIPALITIES_PAGE_SIZE)

  return {
    municipalities,
    pagination: {
      page: filters.page,
      pageSize: ADMIN_MUNICIPALITIES_PAGE_SIZE,
      total,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    } satisfies AdminMunicipalitiesPagination,
  }
}

export async function getAdminMunicipalityById(
  id: string,
): Promise<AdminMunicipalityFormRecord | null> {
  const value = id.trim()
  if (!value) return null
  return prisma.serviceMunicipality.findUnique({
    where: { id: value },
    select: ADMIN_MUNICIPALITY_LIST_SELECT,
  })
}

const MAX_SLUG_ATTEMPTS = 100

export async function findAvailableMunicipalitySlug(
  base: string,
): Promise<string | null> {
  const existing = await prisma.serviceMunicipality.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  })
  const taken = new Set(existing.map((item) => item.slug))

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidate = generateSlugWithSuffix(base, attempt)
    if (!taken.has(candidate)) return candidate
  }
  return null
}

function toWriteData(data: AdminMunicipalityFormValues) {
  return {
    name: data.name,
    region: data.region as ServiceRegion,
    isActive: data.status === 'ACTIVE',
  }
}

export async function createAdminMunicipality(params: {
  data: AdminMunicipalityFormValues
  slug: string
}): Promise<{ id: string }> {
  return prisma.serviceMunicipality.create({
    data: {
      ...toWriteData(params.data),
      slug: params.slug,
      state: 'SP',
      country: 'Brazil',
    },
    select: { id: true },
  })
}

export async function updateAdminMunicipality(params: {
  id: string
  data: AdminMunicipalityFormValues
}): Promise<{ id: string }> {
  return prisma.serviceMunicipality.update({
    where: { id: params.id },
    data: toWriteData(params.data),
    select: { id: true },
  })
}
