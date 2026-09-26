import { describe, expect, it } from 'vitest'

import {
  getActionCenterCutoffs,
  getItemSeverity,
  isKitVisitOverdue,
} from '../../lib/admin/action-center/cutoffs'

import {
  DELIVERY_FAILURE_CATEGORIES,
  PROFILE_QUEUE_EXCLUDED_STATUSES,
  PROFILE_QUEUE_STATUSES,
} from '../../lib/admin/action-center/profile-queues'
import {
  ACTION_CENTER_QUEUE_KEYS,
  ACTION_CENTER_QUEUES,
  getActionCenterQueueHref,
  parseActionCenterPage,
  parseActionCenterQueueSlug,
} from '../../lib/admin/action-center/queues'
import {
  classifySeverity,
  maxSeverity,
} from '../../lib/admin/action-center/severity'
import {
  orderQueueSummaries,
  summarizeCalendarQueue,
  summarizeHumanHandoffQueue,
  type ActionCenterQueueSummary,
} from '../../lib/admin/action-center/summary'
import { ACTION_CENTER_THRESHOLDS } from '../../lib/admin/action-center/thresholds'
import {
  businessWaitMinutes,
  calendarWaitMinutes,
  medianOf,
  splitWaitDuration,
} from '../../lib/admin/action-center/wait-time'
import { JOURNEY_STATUS_VALUES } from '../../lib/journey/status'
import { ADMIN } from '../../lib/i18n/pt-br'

/** Instante em horário de Brasília (UTC-3 fixo). */
function sp(localIso: string): Date {
  return new Date(`${localIso}-03:00`)
}

const DAY = 24 * 60

describe('calendarWaitMinutes', () => {
  it('conta minutos corridos e nunca devolve negativo', () => {
    expect(
      calendarWaitMinutes(sp('2026-09-21T10:00:00'), sp('2026-09-21T12:30:59')),
    ).toBe(150)
    expect(
      calendarWaitMinutes(sp('2026-09-21T12:00:00'), sp('2026-09-21T10:00:00')),
    ).toBe(0)
  })
})

describe('businessWaitMinutes — janela seg–sáb, 9h–18h, Brasília', () => {
  it('parte das datas certas da semana', () => {
    // 21/09/2026 é segunda-feira; 26/09 é sábado; 27/09 é domingo.
    expect(sp('2026-09-21T12:00:00').getUTCDay()).toBe(1)
    expect(sp('2026-09-26T12:00:00').getUTCDay()).toBe(6)
  })

  it('conta só o intervalo dentro do expediente no mesmo dia', () => {
    expect(
      businessWaitMinutes(sp('2026-09-21T10:00:00'), sp('2026-09-21T12:30:00')),
    ).toBe(150)
  })

  it('ignora o período antes da abertura', () => {
    expect(
      businessWaitMinutes(sp('2026-09-21T07:00:00'), sp('2026-09-21T10:00:00')),
    ).toBe(60)
  })

  it('pula a noite e continua no dia seguinte', () => {
    expect(
      businessWaitMinutes(sp('2026-09-21T17:00:00'), sp('2026-09-22T10:00:00')),
    ).toBe(120)
  })

  it('conta o sábado e pula o domingo', () => {
    expect(
      businessWaitMinutes(sp('2026-09-26T17:30:00'), sp('2026-09-28T09:30:00')),
    ).toBe(60)
  })

  it('não acumula nada entre domingo à noite e segunda às 9h', () => {
    expect(
      businessWaitMinutes(sp('2026-09-27T20:00:00'), sp('2026-09-28T09:00:00')),
    ).toBe(0)
  })

  it('não se confunde na virada do dia em UTC (22h em SP já é o dia seguinte em UTC)', () => {
    expect(
      businessWaitMinutes(sp('2026-09-21T22:00:00'), sp('2026-09-22T10:00:00')),
    ).toBe(60)
  })

  it('soma seis dias úteis de nove horas em uma semana completa', () => {
    expect(
      businessWaitMinutes(sp('2026-09-21T09:00:00'), sp('2026-09-28T09:00:00')),
    ).toBe(6 * 9 * 60)
  })

  it('usa o mesmo relógio no verão e no inverno (sem horário de verão)', () => {
    expect(
      businessWaitMinutes(sp('2026-01-12T09:00:00'), sp('2026-01-12T18:00:00')),
    ).toBe(540)
    expect(
      businessWaitMinutes(sp('2026-07-13T09:00:00'), sp('2026-07-13T18:00:00')),
    ).toBe(540)
  })

  it('devolve zero quando o fim vem antes do início', () => {
    expect(
      businessWaitMinutes(sp('2026-09-22T10:00:00'), sp('2026-09-21T10:00:00')),
    ).toBe(0)
  })
})

describe('medianOf e splitWaitDuration', () => {
  it('calcula a mediana de listas ímpares, pares e vazias', () => {
    expect(medianOf([5, 1, 3])).toBe(3)
    expect(medianOf([1, 2, 3, 4])).toBe(3)
    expect(medianOf([])).toBeNull()
  })

  it('escolhe a unidade legível e arredonda para baixo', () => {
    expect(splitWaitDuration(59)).toEqual({ unit: 'minutes', value: 59 })
    expect(splitWaitDuration(60)).toEqual({ unit: 'hours', value: 1 })
    expect(splitWaitDuration(47 * 60 + 59)).toEqual({
      unit: 'hours',
      value: 47,
    })
    expect(splitWaitDuration(48 * 60)).toEqual({ unit: 'days', value: 2 })
    expect(splitWaitDuration(-5)).toEqual({ unit: 'minutes', value: 0 })
  })
})

describe('classifySeverity', () => {
  const thresholds = { mediumMinutes: 21 * DAY, highMinutes: 30 * DAY }

  it('usa cortes inclusivos', () => {
    expect(classifySeverity(21 * DAY - 1, thresholds)).toBe('low')
    expect(classifySeverity(21 * DAY, thresholds)).toBe('medium')
    expect(classifySeverity(30 * DAY, thresholds)).toBe('high')
  })

  it('nunca chega a "alta" quando o corte é nulo', () => {
    expect(
      classifySeverity(10_000 * DAY, ACTION_CENTER_THRESHOLDS.returningDonors),
    ).toBe('medium')
  })

  it('escolhe a maior criticidade', () => {
    expect(maxSeverity('low', 'medium')).toBe('medium')
    expect(maxSeverity('high', 'medium')).toBe('high')
  })

  it('mantém cortes crescentes e a entrada antes do corte médio', () => {
    for (const thresholds of Object.values(ACTION_CENTER_THRESHOLDS)) {
      expect(thresholds.entryMinutes).toBeLessThanOrEqual(
        thresholds.mediumMinutes,
      )
      if (thresholds.highMinutes !== null) {
        expect(thresholds.mediumMinutes).toBeLessThan(thresholds.highMinutes)
      }
    }
  })
})

describe('resumos das filas', () => {
  const now = sp('2026-09-26T12:00:00')

  it('fila vazia não tem criticidade nem espera', () => {
    expect(
      summarizeCalendarQueue({
        key: 'noProgress',
        count: 0,
        oldestSince: null,
        medianWaitMinutes: null,
        now,
      }),
    ).toEqual({
      key: 'noProgress',
      count: 0,
      oldestWaitMinutes: null,
      medianWaitMinutes: null,
      severity: null,
    })
  })

  it('a criticidade da fila é a do item mais antigo', () => {
    const summary = summarizeCalendarQueue({
      key: 'noProgress',
      count: 3,
      oldestSince: new Date(now.getTime() - 31 * DAY * 60_000),
      medianWaitMinutes: 15.4 * DAY,
      now,
    })
    expect(summary.severity).toBe('high')
    expect(summary.oldestWaitMinutes).toBe(31 * DAY)
    expect(summary.medianWaitMinutes).toBe(Math.round(15.4 * DAY))
  })

  it('a visita de kit vencida eleva a criticidade para, no mínimo, média', () => {
    const summary = summarizeCalendarQueue({
      key: 'kitNotDelivered',
      count: 1,
      oldestSince: new Date(now.getTime() - 2 * DAY * 60_000),
      medianWaitMinutes: 2 * DAY,
      now,
      minimumSeverity: 'medium',
    })
    expect(summary.severity).toBe('medium')
  })

  it('atendimento humano mede espera em horário comercial', () => {
    const summary = summarizeHumanHandoffQueue({
      count: 2,
      // Sábado 26/09: 7h (antes do expediente) e 11h.
      pausedSince: [sp('2026-09-26T07:00:00'), sp('2026-09-26T11:00:00')],
      now,
    })
    expect(summary.oldestWaitMinutes).toBe(180)
    expect(summary.medianWaitMinutes).toBe(120)
    expect(summary.severity).toBe('medium')
  })

  it('ordena por criticidade, depois pela espera mais longa, e separa as vazias', () => {
    const summaries: ActionCenterQueueSummary[] = [
      {
        key: 'noProgress',
        count: 4,
        oldestWaitMinutes: 22 * DAY,
        medianWaitMinutes: null,
        severity: 'medium',
      },
      {
        key: 'humanHandoff',
        count: 1,
        oldestWaitMinutes: 300,
        medianWaitMinutes: 300,
        severity: 'high',
      },
      {
        key: 'kitNotDelivered',
        count: 0,
        oldestWaitMinutes: null,
        medianWaitMinutes: null,
        severity: null,
      },
      {
        key: 'firstDonation',
        count: 2,
        oldestWaitMinutes: 40 * DAY,
        medianWaitMinutes: null,
        severity: 'medium',
      },
      {
        key: 'returningDonors',
        count: 1,
        oldestWaitMinutes: 61 * DAY,
        medianWaitMinutes: null,
        severity: 'low',
      },
      {
        key: 'deliveryFailures',
        count: 0,
        oldestWaitMinutes: null,
        medianWaitMinutes: null,
        severity: null,
      },
    ]

    const { active, clear } = orderQueueSummaries(summaries)

    expect(active.map((summary) => summary.key)).toEqual([
      'humanHandoff',
      'firstDonation',
      'noProgress',
      'returningDonors',
    ])
    expect(clear.map((summary) => summary.key)).toEqual([
      'kitNotDelivered',
      'deliveryFailures',
    ])
  })
})

describe('slugs e paginação', () => {
  it('resolve todos os slugs fixos e só eles', () => {
    for (const key of ACTION_CENTER_QUEUE_KEYS) {
      expect(parseActionCenterQueueSlug(ACTION_CENTER_QUEUES[key].slug)).toBe(
        key,
      )
    }
    expect(parseActionCenterQueueSlug('cadastros-incompletos')).toBeNull()
    expect(parseActionCenterQueueSlug('noProgress')).toBeNull()
    expect(parseActionCenterQueueSlug('')).toBeNull()
    expect(parseActionCenterQueueSlug(undefined)).toBeNull()
    expect(parseActionCenterQueueSlug(['sem-avanco'])).toBeNull()
  })

  it('usa slugs únicos', () => {
    const slugs = ACTION_CENTER_QUEUE_KEYS.map(
      (key) => ACTION_CENTER_QUEUES[key].slug,
    )
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('normaliza a página', () => {
    expect(parseActionCenterPage(undefined)).toBe(1)
    expect(parseActionCenterPage('3')).toBe(3)
    expect(parseActionCenterPage(['2', '5'])).toBe(2)
    expect(parseActionCenterPage('0')).toBe(1)
    expect(parseActionCenterPage('-4')).toBe(1)
    expect(parseActionCenterPage('abc')).toBe(1)
    expect(parseActionCenterPage('1.5')).toBe(1)
    expect(parseActionCenterPage('99999999')).toBe(1)
  })

  it('monta links sem dado pessoal', () => {
    expect(getActionCenterQueueHref('noProgress')).toBe(
      '/admin/atencao/sem-avanco',
    )
    expect(getActionCenterQueueHref('noProgress', 2)).toBe(
      '/admin/atencao/sem-avanco?page=2',
    )
  })
})

describe('partição das filas de jornada', () => {
  it('cobre cada status exatamente uma vez, contando os excluídos', () => {
    const assigned = [
      ...Object.values(PROFILE_QUEUE_STATUSES).flat(),
      ...PROFILE_QUEUE_EXCLUDED_STATUSES,
    ]
    expect(new Set(assigned).size).toBe(assigned.length)
    expect(new Set(assigned)).toEqual(new Set(JOURNEY_STATUS_VALUES))
  })
})

describe('copy da Central de Ação', () => {
  const copy = ADMIN.actionCenter

  it('tem título, ação recomendada e descrição para todas as filas', () => {
    for (const key of ACTION_CENTER_QUEUE_KEYS) {
      expect(copy.queues[key].title.length).toBeGreaterThan(0)
      expect(copy.queues[key].action.length).toBeGreaterThan(0)
      expect(copy.queues[key].description.length).toBeGreaterThan(0)
    }
    for (const category of DELIVERY_FAILURE_CATEGORIES) {
      expect(copy.failureCategories[category].length).toBeGreaterThan(0)
    }
  })

  it('não usa linguagem de abandono, agendamento ou confirmação de coleta', () => {
    const text = JSON.stringify(copy).toLowerCase()
    for (const forbidden of [
      'abandon',
      'desist',
      'agendad',
      'coleta confirmada',
      'doadora ativa',
      'aprovad',
      'reprovad',
    ]) {
      expect(text).not.toContain(forbidden)
    }
  })

  it('menciona o Lactare nos responsáveis e deixa claro que é um papel', () => {
    for (const owner of Object.values(copy.owners)) {
      expect(owner).toContain('Lactare')
    }
    expect(copy.ownerNote.length).toBeGreaterThan(0)
  })
})

describe('cortes e criticidade por item', () => {
  const now = new Date('2026-09-26T15:00:00.000Z')

  it('calcula os cortes a partir dos limites tipados', () => {
    const cutoffs = getActionCenterCutoffs(now)
    expect(now.getTime() - cutoffs.noProgress.getTime()).toBe(
      ACTION_CENTER_THRESHOLDS.noProgress.entryMinutes * 60_000,
    )
    expect(now.getTime() - cutoffs.kitVisitOverdue.getTime()).toBe(DAY * 60_000)
  })

  it('considera a visita de kit vencida só depois da tolerância', () => {
    expect(isKitVisitOverdue(null, now)).toBe(false)
    expect(
      isKitVisitOverdue(new Date(now.getTime() - 2 * DAY * 60_000), now),
    ).toBe(true)
    expect(isKitVisitOverdue(new Date(now.getTime() - 60 * 60_000), now)).toBe(
      false,
    )
  })

  it('eleva só a fila de kit quando a visita venceu', () => {
    expect(
      getItemSeverity('kitNotDelivered', 60, { kitVisitOverdue: true }),
    ).toBe('medium')
    expect(getItemSeverity('kitNotDelivered', 60)).toBe('low')
    expect(getItemSeverity('noProgress', 60, { kitVisitOverdue: true })).toBe(
      'low',
    )
    expect(getItemSeverity('deliveryFailures', 0)).toBe('medium')
  })
})
