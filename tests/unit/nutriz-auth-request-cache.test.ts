import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  getUser: vi.fn(),
  profileFindUnique: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('react', () => ({
  cache: <T>(resolver: () => T) => {
    let initialized = false
    let value: T
    return () => {
      if (!initialized) {
        value = resolver()
        initialized = true
      }
      return value
    }
  },
}))

vi.mock('../../lib/auth/supabase-server', () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: { findUnique: mocks.profileFindUnique },
  },
}))

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import { requireNutrizUser } from '../../lib/auth/get-nutriz-user'

describe('cache de autenticação da área da nutriz', () => {
  it('compartilha sessão e perfil entre layout e página na mesma renderização', async () => {
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: { getUser: mocks.getUser },
    })
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-1' } },
    })
    mocks.profileFindUnique.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      fullName: 'Ana Silva',
      email: 'ana@example.com',
      state: 'SP',
      city: 'Osasco',
      deletedAt: null,
    })

    const [fromLayout, fromPage] = await Promise.all([
      requireNutrizUser(),
      requireNutrizUser(),
    ])

    expect(fromLayout).toEqual(fromPage)
    expect(mocks.createSupabaseServerClient).toHaveBeenCalledOnce()
    expect(mocks.getUser).toHaveBeenCalledOnce()
    expect(mocks.profileFindUnique).toHaveBeenCalledOnce()
    expect(mocks.redirect).not.toHaveBeenCalled()
  })
})
