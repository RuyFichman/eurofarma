import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  profileFindFirst: vi.fn(),
  referralFindUnique: vi.fn(),
  referralCreate: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { findFirst: mocks.profileFindFirst },
    referralLink: {
      findUnique: mocks.referralFindUnique,
      create: mocks.referralCreate,
    },
  },
}))

import { getOrCreateNutrizReferralLink } from '../../lib/db/queries/referral-links'

const profileId = '11111111-1111-4111-8111-111111111111'

describe('link próprio de indicação', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.profileFindFirst.mockResolvedValue({ id: profileId })
  })

  it('não cria link para um perfil inválido', async () => {
    await expect(
      getOrCreateNutrizReferralLink('perfil-inválido'),
    ).resolves.toBeNull()
    expect(mocks.profileFindFirst).not.toHaveBeenCalled()
  })

  it('reutiliza o link estável já criado para a própria nutriz', async () => {
    mocks.referralFindUnique.mockResolvedValue({
      code: 'nlr_1234567890123456789012',
    })

    await expect(getOrCreateNutrizReferralLink(profileId)).resolves.toEqual({
      code: 'nlr_1234567890123456789012',
    })
    expect(mocks.referralCreate).not.toHaveBeenCalled()
  })

  it('cria um único código opaco para o perfil ativo', async () => {
    mocks.referralFindUnique.mockResolvedValue(null)
    mocks.referralCreate.mockResolvedValue({
      code: 'nlr_1234567890123456789012',
    })

    await expect(getOrCreateNutrizReferralLink(profileId)).resolves.toEqual({
      code: 'nlr_1234567890123456789012',
    })
    expect(mocks.referralCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ nutrizProfileId: profileId }),
      select: { code: true },
    })
  })
})
