import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  lookupCepAddress: vi.fn(),
  findMunicipality: vi.fn(),
}))

vi.mock('../../lib/coverage/viacep', () => ({
  lookupCepAddress: mocks.lookupCepAddress,
}))

vi.mock('../../lib/db/queries/service-municipalities', () => ({
  getActiveServiceMunicipalityByLocation: mocks.findMunicipality,
}))

import { POST } from '../../app/api/coverage/route'

let requestSequence = 0

function request(body: unknown): NextRequest {
  requestSequence += 1
  return new NextRequest('http://localhost/api/coverage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': `198.51.100.${requestSequence}`,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita CEP inválido antes de consultar o provedor', async () => {
    const response = await POST(request({ cep: '123' }))

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: { code: 'INVALID_CEP' },
    })
    expect(mocks.lookupCepAddress).not.toHaveBeenCalled()
  })

  it('indica possibilidade quando o município está ativo', async () => {
    mocks.lookupCepAddress.mockResolvedValue({
      ok: true,
      address: { cep: '01001-000', city: 'São Paulo', state: 'SP' },
    })
    mocks.findMunicipality.mockResolvedValue({
      id: 'municipality-1',
      slug: 'sao-paulo',
      name: 'São Paulo',
      state: 'SP',
      country: 'Brazil',
      region: 'CAPITAL',
    })

    const response = await POST(request({ cep: '01001-000' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      eligible: true,
      location: { city: 'São Paulo', state: 'SP' },
      residentialCollection: {
        status: 'POSSIBLE',
        requiresLactareConfirmation: true,
      },
    })
    expect(mocks.findMunicipality).toHaveBeenCalledWith('São Paulo', 'SP')
  })

  it('informa fora de cobertura quando o município não está ativo', async () => {
    mocks.lookupCepAddress.mockResolvedValue({
      ok: true,
      address: { cep: '13010-000', city: 'Campinas', state: 'SP' },
    })
    mocks.findMunicipality.mockResolvedValue(null)

    const response = await POST(request({ cep: '13010-000' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      eligible: false,
      location: { city: 'Campinas', state: 'SP' },
      municipality: null,
      residentialCollection: { status: 'OUTSIDE_COVERAGE' },
    })
  })

  it('diferencia CEP inexistente de indisponibilidade externa', async () => {
    mocks.lookupCepAddress.mockResolvedValueOnce({
      ok: false,
      reason: 'NOT_FOUND',
    })
    const notFound = await POST(request({ cep: '99999-999' }))
    expect(notFound.status).toBe(404)
    expect(await notFound.json()).toMatchObject({
      error: { code: 'CEP_NOT_FOUND' },
    })

    mocks.lookupCepAddress.mockResolvedValueOnce({
      ok: false,
      reason: 'UNAVAILABLE',
    })
    const unavailable = await POST(request({ cep: '01001-000' }))
    expect(unavailable.status).toBe(502)
    expect(await unavailable.json()).toMatchObject({
      error: { code: 'CEP_LOOKUP_UNAVAILABLE' },
    })
  })
})
