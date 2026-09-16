import type { Prisma } from '@prisma/client'

import type { JourneyStatusValue } from '../../journey/status'
import { personalRecordIdSchema } from '../../validators/nutriz-personal-area'
import { nutrizProfileIdSchema } from '../../validators/journey-status'
import { prisma } from '../prisma'

const EXTRACTION_SELECT = {
  id: true,
  recordedAt: true,
  volumeMl: true,
} as const satisfies Prisma.ExtractionLogSelect

const WELLBEING_SELECT = {
  id: true,
  feeling: true,
  recordedAt: true,
} as const satisfies Prisma.WellbeingEntrySelect

const RECOGNITION_SELECT = {
  id: true,
  kind: true,
  journeyStatus: true,
  assignedAt: true,
} as const satisfies Prisma.NutrizRecognitionSelect

export type NutrizPersonalAreaData = {
  extractionLogs: Array<
    Prisma.ExtractionLogGetPayload<{ select: typeof EXTRACTION_SELECT }>
  >
  extractionTotalMl: number
  extractionCount: number
  wellbeingEntries: Array<
    Prisma.WellbeingEntryGetPayload<{ select: typeof WELLBEING_SELECT }>
  >
  recognitions: Array<
    Prisma.NutrizRecognitionGetPayload<{ select: typeof RECOGNITION_SELECT }>
  >
}

type JourneyExportSnapshot = {
  journeyStatus: JourneyStatusValue
  createdAt: Date
  journeyHistory: Array<{
    id: string
    toStatus: JourneyStatusValue
    changedAt: Date
  }>
}

function validProfileId(value: string): string | null {
  const id = value.trim()
  return nutrizProfileIdSchema.safeParse(id).success ? id : null
}

/**
 * Retorna somente registros pessoais pertencentes ao perfil ativo. A checagem
 * do vínculo com a sessão acontece em `requireNutrizUser`; esta segunda
 * barreira cruza sempre o id recebido com o próprio perfil no banco.
 */
export async function getNutrizPersonalAreaData(
  nutrizProfileId: string,
): Promise<NutrizPersonalAreaData | null> {
  const id = validProfileId(nutrizProfileId)
  if (!id) return null

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  })
  if (!profile) return null

  const [extractionLogs, extractionSummary, wellbeingEntries, recognitions] =
    await Promise.all([
      prisma.extractionLog.findMany({
        where: { nutrizProfileId: id },
        select: EXTRACTION_SELECT,
        orderBy: [{ recordedAt: 'desc' }, { id: 'desc' }],
        take: 50,
      }),
      prisma.extractionLog.aggregate({
        where: { nutrizProfileId: id },
        _sum: { volumeMl: true },
        _count: { _all: true },
      }),
      prisma.wellbeingEntry.findMany({
        where: { nutrizProfileId: id },
        select: WELLBEING_SELECT,
        orderBy: [{ recordedAt: 'desc' }, { id: 'desc' }],
        take: 12,
      }),
      prisma.nutrizRecognition.findMany({
        where: { nutrizProfileId: id },
        select: RECOGNITION_SELECT,
        orderBy: [{ assignedAt: 'asc' }, { id: 'asc' }],
      }),
    ])

  return {
    extractionLogs,
    extractionTotalMl: extractionSummary._sum.volumeMl ?? 0,
    extractionCount: extractionSummary._count._all,
    wellbeingEntries,
    recognitions,
  }
}

export async function createNutrizExtractionLog(input: {
  nutrizProfileId: string
  recordedAt: Date
  volumeMl: number
}): Promise<boolean> {
  const id = validProfileId(input.nutrizProfileId)
  if (!id) return false

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  })
  if (!profile) return false

  await prisma.extractionLog.create({
    data: {
      nutrizProfileId: id,
      recordedAt: input.recordedAt,
      volumeMl: input.volumeMl,
    },
    select: { id: true },
  })
  return true
}

export async function deleteNutrizExtractionLog(input: {
  nutrizProfileId: string
  extractionLogId: string
}): Promise<boolean> {
  const profileId = validProfileId(input.nutrizProfileId)
  const recordId = input.extractionLogId.trim()
  if (!profileId || !personalRecordIdSchema.safeParse(recordId).success)
    return false

  const result = await prisma.extractionLog.deleteMany({
    where: {
      id: recordId,
      nutrizProfileId: profileId,
      nutrizProfile: { deletedAt: null },
    },
  })
  return result.count === 1
}

export async function createNutrizWellbeingEntry(input: {
  nutrizProfileId: string
  feeling: 'GOOD' | 'OK' | 'TIRED'
  recordedAt: Date
}): Promise<boolean> {
  const id = validProfileId(input.nutrizProfileId)
  if (!id) return false

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, journeyStatus: true },
  })
  if (!profile) return false
  if (
    profile.journeyStatus !== 'DONATION_CONFIRMED' &&
    profile.journeyStatus !== 'RECURRING_DONATION_ELIGIBLE'
  ) {
    return false
  }

  await prisma.wellbeingEntry.create({
    data: {
      nutrizProfileId: id,
      feeling: input.feeling,
      recordedAt: input.recordedAt,
    },
    select: { id: true },
  })
  return true
}

export async function deleteNutrizWellbeingEntry(input: {
  nutrizProfileId: string
  wellbeingEntryId: string
}): Promise<boolean> {
  const profileId = validProfileId(input.nutrizProfileId)
  const recordId = input.wellbeingEntryId.trim()
  if (!profileId || !personalRecordIdSchema.safeParse(recordId).success)
    return false

  const result = await prisma.wellbeingEntry.deleteMany({
    where: {
      id: recordId,
      nutrizProfileId: profileId,
      nutrizProfile: { deletedAt: null },
    },
  })
  return result.count === 1
}

export async function getNutrizPersonalExportData(
  nutrizProfileId: string,
): Promise<{
  fullName: string
  journey: JourneyExportSnapshot
  extractionLogs: Array<
    Prisma.ExtractionLogGetPayload<{ select: typeof EXTRACTION_SELECT }>
  >
  wellbeingEntries: Array<
    Prisma.WellbeingEntryGetPayload<{ select: typeof WELLBEING_SELECT }>
  >
} | null> {
  const id = validProfileId(nutrizProfileId)
  if (!id) return null

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: {
      fullName: true,
      journeyStatus: true,
      createdAt: true,
      journeyHistory: {
        select: { id: true, toStatus: true, changedAt: true },
        orderBy: [{ changedAt: 'asc' }, { id: 'asc' }],
      },
      extractionLogs: {
        select: EXTRACTION_SELECT,
        orderBy: [{ recordedAt: 'asc' }, { id: 'asc' }],
      },
      wellbeingEntries: {
        select: WELLBEING_SELECT,
        orderBy: [{ recordedAt: 'asc' }, { id: 'asc' }],
      },
    },
  })
  if (!profile) return null

  return {
    fullName: profile.fullName,
    journey: {
      journeyStatus: profile.journeyStatus,
      createdAt: profile.createdAt,
      journeyHistory: profile.journeyHistory,
    },
    extractionLogs: profile.extractionLogs,
    wellbeingEntries: profile.wellbeingEntries,
  }
}
