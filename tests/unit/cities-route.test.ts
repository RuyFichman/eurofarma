import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getActiveMunicipalities: vi.fn(),
}))

vi.mock('../../lib/db/queries/service-municipalities', () => ({
  getActiveServiceMunicipalities: mocks.getActiveMunicipalities,
}))

import { GET } from '../../app/api/cities/route'

function request(query = ''): NextRequest {
  return new NextRequest(`http://localhost/api/cities${query}`)
}

describe('GET /api/cities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('entrega a lista pública com cache compartilhado', async () => {
    mocks.getActiveMunicipalities.mockResolvedValue([
      { name: 'Osasco' },
      { name: 'São Paulo' },
    ])

    const response = await GET(request('?state=SP'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      state: 'SP',
      cities: ['Osasco', 'São Paulo'],
      count: 2,
    })
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    )
  })

  it('não consulta o banco para outra UF e permite cachear a resposta vazia', async () => {
    const response = await GET(request('?state=RJ'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      state: 'RJ',
      cities: [],
      count: 0,
    })
    expect(mocks.getActiveMunicipalities).not.toHaveBeenCalled()
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600')
  })

  it('não armazena respostas de erro', async () => {
    const response = await GET(request())

    expect(response.status).toBe(400)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })
})
