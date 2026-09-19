import { nutrizProfileIdSchema } from '../../validators/journey-status'
import type { NutrizAccountUpdateInput } from '../../validators/nutriz-account'
import { prisma } from '../prisma'

/**
 * Recorte dos próprios dados cadastrais. Sem observação administrativa, sem
 * histórico e sem qualquer campo operacional do Lactare.
 */
export type NutrizAccountData = {
  fullName: string
  phoneWhatsapp: string
  email: string | null
  city: string
  state: string
  lgpdConsentAt: Date
}

export async function getNutrizAccountData(
  nutrizProfileId: string,
): Promise<NutrizAccountData | null> {
  const id = nutrizProfileId.trim()
  if (!nutrizProfileIdSchema.safeParse(id).success) return null

  return prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: {
      fullName: true,
      phoneWhatsapp: true,
      email: true,
      city: true,
      state: true,
      lgpdConsentAt: true,
    },
  })
}

/**
 * Atualiza somente os campos que a nutriz pode editar. Lista explícita de
 * propósito: o input vem do cliente e não pode alcançar status da jornada,
 * consentimentos ou dimensões derivadas do dashboard.
 */
export async function updateNutrizAccount(input: {
  nutrizProfileId: string
  data: NutrizAccountUpdateInput
}): Promise<boolean> {
  const id = input.nutrizProfileId.trim()
  if (!nutrizProfileIdSchema.safeParse(id).success) return false

  const result = await prisma.nutrizProfile.updateMany({
    where: { id, deletedAt: null },
    data: {
      fullName: input.data.fullName,
      city: input.data.city,
      state: input.data.state,
    },
  })

  return result.count > 0
}

/**
 * Exclusão pedida pela própria nutriz: soft delete no perfil.
 *
 * É o mesmo `deletedAt` que o gate de acesso já consulta, então a conta perde
 * o acesso à área imediatamente. A remoção definitiva dos registros continua
 * sendo um procedimento operacional do Lactare, com o histórico administrativo
 * preservado enquanto a retenção legal não for definida.
 */
export async function softDeleteNutrizAccount(
  nutrizProfileId: string,
): Promise<boolean> {
  const id = nutrizProfileId.trim()
  if (!nutrizProfileIdSchema.safeParse(id).success) return false

  const result = await prisma.nutrizProfile.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  })

  return result.count > 0
}
