import { describe, expect, it, vi } from 'vitest'

import { resolveWhatsappCoverageInput } from '../../lib/whatsapp/coverage'

const OSASCO = {
  id: 'municipality-1',
  slug: 'osasco-sp',
  name: 'Osasco',
  state: 'SP',
  country: 'Brazil',
  region: 'WEST' as const,
}

describe('resolveWhatsappCoverageInput', () => {
  it('resolve CEP atendido sem devolver o CEP no resultado', async () => {
    const lookupCep = vi.fn().mockResolvedValue({
      ok: true,
      address: { cep: '06000000', city: 'Osasco', state: 'SP' },
    })
    const findMunicipality = vi.fn().mockResolvedValue(OSASCO)

    const result = await resolveWhatsappCoverageInput('06000-000', {
      lookupCep,
      findMunicipality,
    })

    expect(lookupCep).toHaveBeenCalledWith('06000000')
    expect(findMunicipality).toHaveBeenCalledWith('Osasco', 'SP')
    expect(result).toEqual({ kind: 'eligible', city: 'Osasco', state: 'SP' })
    expect(JSON.stringify(result)).not.toContain('06000')
  })

  it('classifica CEP fora da lista ativa', async () => {
    const result = await resolveWhatsappCoverageInput('13010-000', {
      lookupCep: vi.fn().mockResolvedValue({
        ok: true,
        address: { cep: '13010000', city: 'Campinas', state: 'SP' },
      }),
      findMunicipality: vi.fn().mockResolvedValue(null),
    })
    expect(result).toEqual({
      kind: 'outside',
      city: 'Campinas',
      state: 'SP',
    })
  })

  it('consulta município digitado como SP', async () => {
    const findMunicipality = vi.fn().mockResolvedValue(OSASCO)
    const result = await resolveWhatsappCoverageInput('  Osasco  ', {
      lookupCep: vi.fn(),
      findMunicipality,
    })
    expect(findMunicipality).toHaveBeenCalledWith('Osasco', 'SP')
    expect(result.kind).toBe('eligible')
  })

  it('rejeita CEP inválido antes de consultar serviços', async () => {
    const lookupCep = vi.fn()
    const findMunicipality = vi.fn()
    const result = await resolveWhatsappCoverageInput('123', {
      lookupCep,
      findMunicipality,
    })
    expect(result).toEqual({ kind: 'invalid' })
    expect(lookupCep).not.toHaveBeenCalled()
    expect(findMunicipality).not.toHaveBeenCalled()
  })

  it('diferencia CEP inexistente de indisponibilidade', async () => {
    const findMunicipality = vi.fn()
    const notFound = await resolveWhatsappCoverageInput('06000-001', {
      lookupCep: vi.fn().mockResolvedValue({ ok: false, reason: 'NOT_FOUND' }),
      findMunicipality,
    })
    const unavailable = await resolveWhatsappCoverageInput('06000-002', {
      lookupCep: vi
        .fn()
        .mockResolvedValue({ ok: false, reason: 'UNAVAILABLE' }),
      findMunicipality,
    })
    expect(notFound).toEqual({ kind: 'invalid' })
    expect(unavailable).toEqual({ kind: 'unavailable' })
  })

  it('trata falha do banco como indisponibilidade', async () => {
    const result = await resolveWhatsappCoverageInput('Osasco', {
      lookupCep: vi.fn(),
      findMunicipality: vi.fn().mockRejectedValue(new Error('database down')),
    })
    expect(result).toEqual({ kind: 'unavailable' })
  })
})
