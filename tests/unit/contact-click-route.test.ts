import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  recordContactChannelClick: vi.fn(),
}))

vi.mock('../../lib/db/queries/contact-clicks', () => ({
  recordContactChannelClick: mocks.recordContactChannelClick,
}))

import { POST } from '../../app/api/contact-click/route'

let requestSequence = 0

function request(body: unknown): NextRequest {
  requestSequence += 1
  return new NextRequest('http://localhost/api/contact-click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': `203.0.113.${requestSequence}`,
    },
    body: JSON.stringify(body),
  })
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    event: 'lactare_contact_clicked',
    channel: 'whatsapp',
    surface: 'coverage_result',
    ...overrides,
  }
}

describe('POST /api/contact-click', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.recordContactChannelClick.mockResolvedValue({ id: 'click-1' })
  })

  it('registra o clique e responde sem corpo', async () => {
    const response = await POST(request(payload()))

    expect(response.status).toBe(204)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(mocks.recordContactChannelClick).toHaveBeenCalledWith({
      channel: 'whatsapp',
      surface: 'coverage_result',
      sourceUtm: null,
    })
  })

  it('persiste apenas as chaves UTM conhecidas', async () => {
    await POST(
      request(
        payload({
          channel: 'phone',
          source_utm: {
            utm_source: 'instagram',
            utm_medium: null,
            cep: '01001-000',
            email: 'maria@example.com',
          },
        }),
      ),
    )

    expect(mocks.recordContactChannelClick).toHaveBeenCalledWith({
      channel: 'phone',
      surface: 'coverage_result',
      sourceUtm: { utm_source: 'instagram' },
    })
  })

  it('recusa payload inválido antes de tocar o banco', async () => {
    const response = await POST(request(payload({ channel: 'email' })))

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: { code: 'INVALID_CONTACT_CLICK' },
    })
    expect(mocks.recordContactChannelClick).not.toHaveBeenCalled()
  })

  it('não vaza detalhe do banco quando a gravação falha', async () => {
    mocks.recordContactChannelClick.mockRejectedValueOnce(
      new Error('connection to server at "db.supabase.co" failed'),
    )

    const response = await POST(request(payload()))
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toMatchObject({ error: { code: 'CONTACT_CLICK_UNAVAILABLE' } })
    expect(JSON.stringify(body)).not.toContain('supabase')
  })

  it('bloqueia rajada do mesmo cliente', async () => {
    const ip = '198.51.100.77'
    const burst = () =>
      POST(
        new NextRequest('http://localhost/api/contact-click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': ip,
          },
          body: JSON.stringify(payload()),
        }),
      )

    const responses = []
    for (let attempt = 0; attempt < 21; attempt += 1) {
      responses.push(await burst())
    }

    expect(responses.slice(0, 20).every((r) => r.status === 204)).toBe(true)
    const last = responses[20]
    expect(last?.status).toBe(429)
    expect(last?.headers.get('Retry-After')).toBeTruthy()
  })
})
