import { Prisma } from '@prisma/client'

import type { AdminCampaignFilters } from '../../admin/campaigns/filters'
import { ADMIN_CAMPAIGNS_PAGE_SIZE } from '../../admin/campaigns/filters'
import type { AdminCampaignFormValues } from '../../admin/campaigns/campaign-form-schema'
import { prisma } from '../prisma'

const ADMIN_CAMPAIGN_LIST_SELECT = {
  id: true,
  name: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  landingUrl: true,
  isActive: true,
  createdAt: true,
} as const satisfies Prisma.CampaignSelect

const ADMIN_CAMPAIGN_FORM_SELECT = {
  ...ADMIN_CAMPAIGN_LIST_SELECT,
} as const satisfies Prisma.CampaignSelect

export type AdminCampaignListItem = Prisma.CampaignGetPayload<{
  select: typeof ADMIN_CAMPAIGN_LIST_SELECT
}>

export type AdminCampaignFormRecord = Prisma.CampaignGetPayload<{
  select: typeof ADMIN_CAMPAIGN_FORM_SELECT
}>

export type AdminCampaignsPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export async function getAdminCampaigns(filters: AdminCampaignFilters) {
  const where: Prisma.CampaignWhereInput = {}

  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { utmSource: { contains: filters.query, mode: 'insensitive' } },
      { utmCampaign: { contains: filters.query, mode: 'insensitive' } },
    ]
  }
  if (filters.status) {
    where.isActive = filters.status === 'ACTIVE'
  }
  if (filters.source) {
    where.utmSource = { equals: filters.source, mode: 'insensitive' }
  }

  const [total, campaigns, sourceRows] = await prisma.$transaction([
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      select: ADMIN_CAMPAIGN_LIST_SELECT,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
      skip: (filters.page - 1) * ADMIN_CAMPAIGNS_PAGE_SIZE,
      take: ADMIN_CAMPAIGNS_PAGE_SIZE,
    }),
    prisma.campaign.findMany({
      distinct: ['utmSource'],
      select: { utmSource: true },
      orderBy: { utmSource: 'asc' },
    }),
  ])
  const totalPages =
    total === 0 ? 0 : Math.ceil(total / ADMIN_CAMPAIGNS_PAGE_SIZE)

  return {
    campaigns,
    sources: sourceRows.map(({ utmSource }) => utmSource),
    pagination: {
      page: filters.page,
      pageSize: ADMIN_CAMPAIGNS_PAGE_SIZE,
      total,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    } satisfies AdminCampaignsPagination,
  }
}

export async function getAdminCampaignById(
  id: string,
): Promise<AdminCampaignFormRecord | null> {
  const value = id.trim()
  if (!value) return null
  return prisma.campaign.findUnique({
    where: { id: value },
    select: ADMIN_CAMPAIGN_FORM_SELECT,
  })
}

export async function hasCampaignTrackingKey(params: {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  excludeId?: string
}): Promise<boolean> {
  const campaign = await prisma.campaign.findFirst({
    where: {
      utmSource: { equals: params.utmSource, mode: 'insensitive' },
      utmMedium: { equals: params.utmMedium, mode: 'insensitive' },
      utmCampaign: { equals: params.utmCampaign, mode: 'insensitive' },
      ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
    },
    select: { id: true },
  })
  return campaign !== null
}

function toWriteData(data: AdminCampaignFormValues) {
  return {
    name: data.name,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    landingUrl: data.landingUrl,
    isActive: data.status === 'ACTIVE',
  }
}

export async function createAdminCampaign(params: {
  data: AdminCampaignFormValues
  createdByUserId: string
}): Promise<{ id: string }> {
  return prisma.campaign.create({
    data: {
      ...toWriteData(params.data),
      createdByUserId: params.createdByUserId,
    },
    select: { id: true },
  })
}

export async function updateAdminCampaign(params: {
  id: string
  data: AdminCampaignFormValues
}): Promise<{ id: string }> {
  return prisma.campaign.update({
    where: { id: params.id },
    data: toWriteData(params.data),
    select: { id: true },
  })
}
