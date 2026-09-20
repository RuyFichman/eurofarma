import { Prisma } from '@prisma/client'

import { createReferralCode } from '../../referrals/code'
import { nutrizProfileIdSchema } from '../../validators/journey-status'
import { prisma } from '../prisma'

const MAX_REFERRAL_CODE_ATTEMPTS = 3

function validProfileId(value: string): string | null {
  const id = value.trim()
  return nutrizProfileIdSchema.safeParse(id).success ? id : null
}

/**
 * Cria uma única referência opaca por nutriz, quando ela abre a Minha Área.
 * A referência não contém nome, telefone, cidade nem qualquer recompensa.
 */
export async function getOrCreateNutrizReferralLink(
  nutrizProfileId: string,
): Promise<{ code: string } | null> {
  const id = validProfileId(nutrizProfileId)
  if (!id) return null

  const profile = await prisma.nutrizProfile.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  })
  if (!profile) return null

  const existing = await prisma.referralLink.findUnique({
    where: { nutrizProfileId: id },
    select: { code: true },
  })
  if (existing) return existing

  for (let attempt = 0; attempt < MAX_REFERRAL_CODE_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.referralLink.create({
        data: { nutrizProfileId: id, code: createReferralCode() },
        select: { code: true },
      })
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error
      if (error.code !== 'P2002') throw error

      // Outra requisição da mesma nutriz pode ter vencido a corrida pelo link.
      const concurrent = await prisma.referralLink.findUnique({
        where: { nutrizProfileId: id },
        select: { code: true },
      })
      if (concurrent) return concurrent
    }
  }

  throw new Error('Não foi possível criar o link de indicação.')
}

/**
 * Responde apenas se **algum** cadastro ativo foi atribuído ao link desta
 * nutriz, para o selo "Corrente do bem". O id lido não sai daqui: a nutriz
 * indicadora não recebe identidade, quantidade nem data de quem se cadastrou,
 * porque o RF15 atribui a indicação sem expor dados da pessoa indicada.
 *
 * Perfis com soft delete ficam de fora, como em todo o resto do produto.
 */
export async function hasNutrizReferredSignup(
  nutrizProfileId: string,
): Promise<boolean> {
  const id = validProfileId(nutrizProfileId)
  if (!id) return false

  const referred = await prisma.nutrizProfile.findFirst({
    where: {
      deletedAt: null,
      referredByReferralLink: { nutrizProfileId: id },
    },
    select: { id: true },
  })

  return referred !== null
}
