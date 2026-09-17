import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  findAvailableSlug: vi.fn(),
  createMunicipality: vi.fn(),
  updateMunicipality: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))
vi.mock('../../lib/auth/get-admin-user', () => ({
  requireAdminUser: mocks.requireAdminUser,
}))
vi.mock('../../lib/db/prisma', () => ({
  prisma: { serviceMunicipality: { findUnique: vi.fn() } },
}))
vi.mock('../../lib/db/queries/service-municipalities', () => ({
  SERVICE_MUNICIPALITIES_CACHE_TAG: 'service-municipalities',
  findAvailableMunicipalitySlug: mocks.findAvailableSlug,
  createAdminMunicipality: mocks.createMunicipality,
  updateAdminMunicipality: mocks.updateMunicipality,
}))

import { createAdminMunicipalityAction } from '../../app/admin/(painel)/municipios/actions'

describe('invalidação do cache público de municípios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminUser.mockResolvedValue({ id: 'admin-1' })
    mocks.findAvailableSlug.mockResolvedValue('osasco')
    mocks.createMunicipality.mockResolvedValue({ id: 'municipality-1' })
  })

  it('invalida a tag e todas as superfícies somente depois da gravação', async () => {
    await createAdminMunicipalityAction({
      name: 'Osasco',
      region: 'WEST',
      status: 'ACTIVE',
    })

    expect(mocks.createMunicipality).toHaveBeenCalledOnce()
    expect(mocks.revalidateTag).toHaveBeenCalledWith('service-municipalities')
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/verificar-cobertura')
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/api/cities')
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
    expect(mocks.createMunicipality.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.revalidateTag.mock.invocationCallOrder[0] ?? 0,
    )
  })

  it('não invalida o cache quando a entrada é rejeitada pela validação', async () => {
    await expect(
      createAdminMunicipalityAction({
        name: '',
        region: '',
        status: 'ACTIVE',
      }),
    ).resolves.toMatchObject({ ok: false, code: 'VALIDATION_ERROR' })

    expect(mocks.createMunicipality).not.toHaveBeenCalled()
    expect(mocks.revalidateTag).not.toHaveBeenCalled()
  })
})
