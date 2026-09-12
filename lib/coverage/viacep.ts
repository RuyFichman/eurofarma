import { z } from 'zod'

const VIA_CEP_BASE_URL = 'https://viacep.com.br/ws'
const VIA_CEP_TIMEOUT_MS = 5_000

const viaCepAddressSchema = z.object({
  cep: z.string().min(1),
  localidade: z.string().trim().min(1),
  uf: z.string().trim().length(2),
})

export type CepAddress = {
  cep: string
  city: string
  state: string
}

export type CepLookupResult =
  | { ok: true; address: CepAddress }
  | { ok: false; reason: 'NOT_FOUND' | 'UNAVAILABLE' }

/**
 * Consulta um CEP já validado no ViaCEP. A resposta não é persistida nem
 * registrada em log; serve somente para resolver município e UF.
 */
export async function lookupCepAddress(
  cep: string,
  fetcher: typeof fetch = fetch,
): Promise<CepLookupResult> {
  const digits = cep.replace(/\D/g, '')

  try {
    const response = await fetcher(`${VIA_CEP_BASE_URL}/${digits}/json/`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(VIA_CEP_TIMEOUT_MS),
    })

    if (!response.ok) return { ok: false, reason: 'UNAVAILABLE' }

    const payload: unknown = await response.json()
    // A documentação apresenta boolean, mas o serviço também responde string.
    if (
      payload !== null &&
      typeof payload === 'object' &&
      'erro' in payload &&
      (payload.erro === true || payload.erro === 'true')
    ) {
      return { ok: false, reason: 'NOT_FOUND' }
    }

    const parsed = viaCepAddressSchema.safeParse(payload)
    if (!parsed.success) return { ok: false, reason: 'UNAVAILABLE' }

    return {
      ok: true,
      address: {
        cep: parsed.data.cep,
        city: parsed.data.localidade,
        state: parsed.data.uf.toUpperCase(),
      },
    }
  } catch {
    return { ok: false, reason: 'UNAVAILABLE' }
  }
}
