import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  getActionCenterQueuePage: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
  redirect: vi.fn(),
}))
vi.mock('../../lib/auth/get-admin-user', () => ({
  requireAdminUser: mocks.requireAdminUser,
}))
vi.mock('../../lib/db/queries/admin-action-center', () => ({
  getActionCenterQueuePage: mocks.getActionCenterQueuePage,
}))

import { loadActionCenterQueueRoute } from '../../app/admin/(painel)/atencao/[fila]/load'

function render(fila: string, page?: string) {
  return loadActionCenterQueueRoute({
    params: Promise.resolve({ fila }),
    searchParams: Promise.resolve(page ? { page } : {}),
  })
}

describe('detalhamento da Central de Ação', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getActionCenterQueuePage.mockResolvedValue({
      key: 'noProgress',
      items: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    })
  })

  it('interrompe antes de consultar quando quem acessa não é admin', async () => {
    // `requireAdminUser` redireciona lançando, como o `redirect` do Next.
    mocks.requireAdminUser.mockRejectedValue(new Error('NEXT_REDIRECT'))

    await expect(render('sem-avanco')).rejects.toThrow('NEXT_REDIRECT')
    expect(mocks.getActionCenterQueuePage).not.toHaveBeenCalled()
  })

  it('responde 404 para slug fora da lista fixa, sem consultar', async () => {
    mocks.requireAdminUser.mockResolvedValue({ id: 'admin-1' })

    await expect(render('cadastros-incompletos')).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(mocks.getActionCenterQueuePage).not.toHaveBeenCalled()
  })

  it('consulta a fila e a página validadas para um admin', async () => {
    mocks.requireAdminUser.mockResolvedValue({ id: 'admin-1' })

    await render('sem-avanco', '2')

    expect(mocks.requireAdminUser.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.getActionCenterQueuePage.mock.invocationCallOrder[0] ?? 0,
    )
    expect(mocks.getActionCenterQueuePage).toHaveBeenCalledWith('noProgress', 2)
  })
})
