import { describe, expect, it } from 'vitest'

import { getClientIp } from '../../lib/security/client-ip'

describe('getClientIp', () => {
  it('usa o primeiro endereço encaminhado pelo proxy', () => {
    const headers = new Headers({
      'x-forwarded-for': '198.51.100.10, 203.0.113.20',
    })

    expect(getClientIp(headers)).toBe('198.51.100.10')
  })

  it('usa x-real-ip quando não há cadeia encaminhada', () => {
    const headers = new Headers({ 'x-real-ip': '203.0.113.30' })

    expect(getClientIp(headers)).toBe('203.0.113.30')
  })

  it('usa uma chave estável no ambiente local', () => {
    expect(getClientIp(new Headers())).toBe('unknown')
  })
})
