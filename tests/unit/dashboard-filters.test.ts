import { describe, expect, it } from 'vitest'

import {
  buildDashboardLocationKey,
  hasActiveDashboardFilters,
  parseDashboardFilters,
} from '../../lib/admin/dashboard/filters'

describe('filtros combináveis do dashboard', () => {
  it('aceita região, estágio e origem simultaneamente', () => {
    const filters = parseDashboardFilters({
      region: 'abc',
      stage: 'kit_delivered',
      origin: 'WhatsApp',
    })

    expect(filters).toEqual({
      region: 'ABC',
      stage: 'KIT_DELIVERED',
      origin: 'whatsapp',
    })
    expect(hasActiveDashboardFilters(filters)).toBe(true)
  })

  it('ignora valores desconhecidos e usa somente o primeiro valor da URL', () => {
    const filters = parseDashboardFilters({
      region: ['WEST', 'ABC'],
      stage: 'DONATED',
      origin: 'referral',
    })

    expect(filters).toEqual({ region: 'WEST', stage: '', origin: '' })
  })

  it('aceita os novos marcos da jornada', () => {
    expect(parseDashboardFilters({ stage: 'donation_confirmed' }).stage).toBe(
      'DONATION_CONFIRMED',
    )
  })

  it('reconhece o recorte vazio', () => {
    expect(hasActiveDashboardFilters(parseDashboardFilters({}))).toBe(false)
  })

  it('relaciona a localização sem depender de caixa, acento ou espaços', () => {
    expect(buildDashboardLocationKey(' sp ', '  Santo  Andre ')).toBe(
      buildDashboardLocationKey('SP', 'Santo André'),
    )
  })
})
