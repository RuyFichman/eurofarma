import { UnitStatus } from '@prisma/client'

import { prisma } from '../prisma'
import {
  mapUnitToPublicUnitDetail,
  UNIT_DETAIL_SELECT,
  type PublicUnitDetail,
} from '../../mappers/unit-detail-mapper'

/**
 * Busca uma unidade ATIVA pelo slug, já mapeada para o formato público de
 * detalhes (sem campos admin/PII). Retorna `null` quando o slug não existe ou
 * quando a unidade não está ACTIVE — unidades PENDING/INACTIVE nunca vazam para
 * o público. O `select` restrito vem de `UNIT_DETAIL_SELECT`.
 */
export async function getActiveUnitBySlug(
  slug: string,
): Promise<PublicUnitDetail | null> {
  const trimmed = slug.trim()
  if (trimmed === '') return null

  const unit = await prisma.unit.findFirst({
    where: { slug: trimmed, status: UnitStatus.ACTIVE },
    select: UNIT_DETAIL_SELECT,
  })

  if (!unit) return null
  return mapUnitToPublicUnitDetail(unit)
}
