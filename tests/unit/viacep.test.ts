import { describe, expect, it, vi } from 'vitest'

import { lookupCepAddress } from '../../lib/coverage/viacep'

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('lookupCepAddress', () => {
  it('consulta somente os dígitos e mapeia cidade e UF', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        cep: '01001-000',
        localidade: 'São Paulo',
        uf: 'sp',
      }),
    )

    await expect(
      lookupCepAddress('01001-000', fetcher as typeof fetch),
    ).resolves.toEqual({
      ok: true,
      address: {
        cep: '01001-000',
        city: 'São Paulo',
        state: 'SP',
      },
    })
    expect(fetcher).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01001000/json/',
      expect.objectContaining({ cache: 'no-store' }),
    )
  })

  it.each([{ erro: true }, { erro: 'true' }])(
    'trata o indicador de CEP inexistente do ViaCEP: $erro',
    async (payload) => {
      const fetcher = vi.fn().mockResolvedValue(jsonResponse(payload))

      await expect(
        lookupCepAddress('99999999', fetcher as typeof fetch),
      ).resolves.toEqual({ ok: false, reason: 'NOT_FOUND' })
    },
  )

  it('trata resposta incompleta como indisponibilidade', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(jsonResponse({ cep: '01001-000', uf: 'SP' }))

    await expect(
      lookupCepAddress('01001000', fetcher as typeof fetch),
    ).resolves.toEqual({ ok: false, reason: 'UNAVAILABLE' })
  })

  it('trata erro HTTP como indisponibilidade', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({}, 500))

    await expect(
      lookupCepAddress('01001000', fetcher as typeof fetch),
    ).resolves.toEqual({ ok: false, reason: 'UNAVAILABLE' })
  })

  it('trata falha de rede como indisponibilidade', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network'))

    await expect(
      lookupCepAddress('01001000', fetcher as typeof fetch),
    ).resolves.toEqual({ ok: false, reason: 'UNAVAILABLE' })
  })
})
