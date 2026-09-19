import { Prisma } from '@prisma/client'

import type { AdminContentFilters } from '../../admin/contents/filters'
import { ADMIN_CONTENTS_PAGE_SIZE } from '../../admin/contents/filters'
import type { AdminContentFormValues } from '../../admin/contents/content-form-schema'
import { generateSlugWithSuffix } from '../../utils/slug'
import { prisma } from '../prisma'

const ADMIN_CONTENT_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  category: true,
  isPublished: true,
  publishedAt: true,
  updatedAt: true,
} as const satisfies Prisma.EducationalContentSelect

const ADMIN_CONTENT_FORM_SELECT = {
  ...ADMIN_CONTENT_LIST_SELECT,
  bodyMarkdown: true,
} as const satisfies Prisma.EducationalContentSelect

export type AdminContentListItem = Prisma.EducationalContentGetPayload<{
  select: typeof ADMIN_CONTENT_LIST_SELECT
}>

export type AdminContentFormRecord = Prisma.EducationalContentGetPayload<{
  select: typeof ADMIN_CONTENT_FORM_SELECT
}>

export type AdminContentsPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export async function getAdminContents(filters: AdminContentFilters) {
  const where: Prisma.EducationalContentWhereInput = {}

  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { slug: { contains: filters.query, mode: 'insensitive' } },
      { category: { contains: filters.query, mode: 'insensitive' } },
    ]
  }
  if (filters.status) {
    where.isPublished = filters.status === 'PUBLISHED'
  }
  if (filters.category) {
    where.category = { equals: filters.category, mode: 'insensitive' }
  }

  const [total, contents, categoryRows] = await prisma.$transaction([
    prisma.educationalContent.count({ where }),
    prisma.educationalContent.findMany({
      where,
      select: ADMIN_CONTENT_LIST_SELECT,
      orderBy: [{ isPublished: 'desc' }, { updatedAt: 'desc' }, { id: 'asc' }],
      skip: (filters.page - 1) * ADMIN_CONTENTS_PAGE_SIZE,
      take: ADMIN_CONTENTS_PAGE_SIZE,
    }),
    prisma.educationalContent.findMany({
      where: { category: { not: null } },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    }),
  ])
  const totalPages =
    total === 0 ? 0 : Math.ceil(total / ADMIN_CONTENTS_PAGE_SIZE)

  return {
    contents,
    categories: categoryRows.flatMap(({ category }) =>
      category ? [category] : [],
    ),
    pagination: {
      page: filters.page,
      pageSize: ADMIN_CONTENTS_PAGE_SIZE,
      total,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    } satisfies AdminContentsPagination,
  }
}

export async function getAdminContentById(
  id: string,
): Promise<AdminContentFormRecord | null> {
  const value = id.trim()
  if (!value) return null
  return prisma.educationalContent.findUnique({
    where: { id: value },
    select: ADMIN_CONTENT_FORM_SELECT,
  })
}

const MAX_SLUG_ATTEMPTS = 100

export async function findAvailableContentSlug(
  base: string,
): Promise<string | null> {
  const existing = await prisma.educationalContent.findMany({
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

function toWriteData(data: AdminContentFormValues) {
  return {
    title: data.title,
    category: data.category || null,
    bodyMarkdown: data.bodyMarkdown,
    isPublished: data.status === 'PUBLISHED',
  }
}

export async function createAdminContent(params: {
  data: AdminContentFormValues
  slug: string
  updatedByUserId: string
}): Promise<{ id: string }> {
  const isPublished = params.data.status === 'PUBLISHED'
  return prisma.educationalContent.create({
    data: {
      ...toWriteData(params.data),
      slug: params.slug,
      publishedAt: isPublished ? new Date() : null,
      updatedByUserId: params.updatedByUserId,
    },
    select: { id: true },
  })
}

export async function updateAdminContent(params: {
  id: string
  data: AdminContentFormValues
  currentPublishedAt: Date | null
  updatedByUserId: string
}): Promise<{ id: string }> {
  const isPublished = params.data.status === 'PUBLISHED'
  return prisma.educationalContent.update({
    where: { id: params.id },
    data: {
      ...toWriteData(params.data),
      publishedAt: isPublished
        ? (params.currentPublishedAt ?? new Date())
        : null,
      updatedByUserId: params.updatedByUserId,
    },
    select: { id: true },
  })
}
