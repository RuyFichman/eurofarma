import { describe, expect, it } from 'vitest'

import {
  buildDashboardNutrizScope,
  dashboardNutrizSqlWhere,
  toDashboardNutrizWhere,
} from '../../lib/db/queries/dashboard-segmentation'

describe('recorte de nutrizes do dashboard', () => {
  it('converte os três filtros em dimensões indexáveis', () => {
    const scope = buildDashboardNutrizScope({
      region: 'ABC',
      stage: 'FORM_RECEIVED',
      origin: 'whatsapp',
    })

    expect(scope).toEqual({
      region: 'ABC',
      stage: 'FORM_RECEIVED',
      origin: 'WHATSAPP',
    })
    expect(toDashboardNutrizWhere(scope)).toEqual({
      deletedAt: null,
      dashboardRegion: 'ABC',
      journeyStatus: 'FORM_RECEIVED',
      registrationOrigin: 'WHATSAPP',
    })
  })

  it('não cria filtros extras quando a URL não tem segmentação', () => {
    const scope = buildDashboardNutrizScope({
      region: '',
      stage: '',
      origin: '',
    })

    expect(scope).toEqual({})
    expect(toDashboardNutrizWhere(scope)).toEqual({ deletedAt: null })
  })

  it('aplica ids adicionais sem carregar perfis ou dados pessoais', () => {
    const scope = {
      ...buildDashboardNutrizScope({
        region: 'WEST',
        stage: 'KIT_DELIVERED',
        origin: 'web',
      }),
      profileIds: ['profile-1', 'profile-2'],
    }

    expect(toDashboardNutrizWhere(scope)).toMatchObject({
      id: { in: ['profile-1', 'profile-2'] },
    })
    const sql = dashboardNutrizSqlWhere(scope)
    expect(sql.values).toEqual([
      'KIT_DELIVERED',
      'WEST',
      'WEB',
      'profile-1',
      'profile-2',
    ])
    expect(sql.strings.join(' ')).not.toMatch(/full_name|phone_whatsapp|email/i)
  })
})
