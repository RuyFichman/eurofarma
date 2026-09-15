import {
  JOURNEY_STATUS_VALUES,
  type JourneyStatusValue,
} from '../../journey/status'
import { percentOf } from '../../utils/format-number'

/**
 * Caminho progressivo principal da jornada. `NOT_ELIGIBLE` e uma saida
 * legitima da avaliacao feita pelo Lactare, portanto aparece separadamente e
 * nunca e contabilizada como abandono.
 */
export const JOURNEY_FUNNEL_STAGE_VALUES = [
  'REGISTERED',
  'FORM_RECEIVED',
  'EXAM_SCHEDULED',
  'AWAITING_RESULT',
  'ELIGIBLE',
  'KIT_DELIVERED',
  'RECURRING_DONATION_ELIGIBLE',
] as const satisfies readonly JourneyStatusValue[]

export type JourneyFunnelStage = (typeof JOURNEY_FUNNEL_STAGE_VALUES)[number]

export type JourneyFunnelStep = {
  key: JourneyFunnelStage
  reached: number
  conversionFromPrevious: number | null
  conversionFromStart: number
}

export type JourneyFunnelDropOff = {
  from: JourneyFunnelStage
  to: JourneyFunnelStage
  count: number
  rate: number
}

export type JourneyFunnel = {
  steps: JourneyFunnelStep[]
  dropOffs: JourneyFunnelDropOff[]
  notEligible: number
  overallConversion: number
}

export type JourneyStatusCounts = Record<JourneyStatusValue, number>

const REACHED_BY_STATUS = {
  REGISTERED: JOURNEY_STATUS_VALUES,
  FORM_RECEIVED: [
    'FORM_RECEIVED',
    'EXAM_SCHEDULED',
    'AWAITING_RESULT',
    'ELIGIBLE',
    'NOT_ELIGIBLE',
    'KIT_DELIVERED',
    'RECURRING_DONATION_ELIGIBLE',
  ],
  EXAM_SCHEDULED: [
    'EXAM_SCHEDULED',
    'AWAITING_RESULT',
    'ELIGIBLE',
    'NOT_ELIGIBLE',
    'KIT_DELIVERED',
    'RECURRING_DONATION_ELIGIBLE',
  ],
  AWAITING_RESULT: [
    'AWAITING_RESULT',
    'ELIGIBLE',
    'NOT_ELIGIBLE',
    'KIT_DELIVERED',
    'RECURRING_DONATION_ELIGIBLE',
  ],
  ELIGIBLE: ['ELIGIBLE', 'KIT_DELIVERED', 'RECURRING_DONATION_ELIGIBLE'],
  KIT_DELIVERED: ['KIT_DELIVERED', 'RECURRING_DONATION_ELIGIBLE'],
  RECURRING_DONATION_ELIGIBLE: ['RECURRING_DONATION_ELIGIBLE'],
} as const satisfies Record<JourneyFunnelStage, readonly JourneyStatusValue[]>

function reachedCount(
  stage: JourneyFunnelStage,
  counts: JourneyStatusCounts,
): number {
  return REACHED_BY_STATUS[stage].reduce(
    (total, status) => total + counts[status],
    0,
  )
}

/**
 * Calcula o funil a partir do status atual. Isso e valido enquanto o dominio
 * permanecer progressivo e sem reabertura, como definido no RF16.
 *
 * A diferenca entre etapas significa somente "sem avanco registrado". Sem um
 * evento de desistência ou uma janela operacional validada, ela nao prova que
 * a nutriz abandonou a jornada.
 */
export function buildJourneyFunnel(counts: JourneyStatusCounts): JourneyFunnel {
  const reachedByStage = new Map<JourneyFunnelStage, number>(
    JOURNEY_FUNNEL_STAGE_VALUES.map((stage) => [
      stage,
      reachedCount(stage, counts),
    ]),
  )
  const started = reachedByStage.get('REGISTERED') ?? 0

  const steps = JOURNEY_FUNNEL_STAGE_VALUES.map((stage, index) => {
    const reached = reachedByStage.get(stage) ?? 0
    const previous =
      index > 0 ? JOURNEY_FUNNEL_STAGE_VALUES[index - 1] : undefined
    const previousReached = previous
      ? (reachedByStage.get(previous) ?? 0)
      : null

    return {
      key: stage,
      reached,
      conversionFromPrevious:
        previousReached === null ? null : percentOf(reached, previousReached),
      conversionFromStart: percentOf(reached, started),
    }
  })

  const dropOffs = JOURNEY_FUNNEL_STAGE_VALUES.slice(0, -1).map(
    (from, index) => {
      const to = JOURNEY_FUNNEL_STAGE_VALUES[index + 1]
      const fromReached = reachedByStage.get(from) ?? 0
      const toReached = to ? (reachedByStage.get(to) ?? 0) : 0
      const legitimateExit =
        from === 'AWAITING_RESULT' && to === 'ELIGIBLE'
          ? counts.NOT_ELIGIBLE
          : 0
      const count = Math.max(0, fromReached - toReached - legitimateExit)

      return {
        from,
        to: to ?? 'RECURRING_DONATION_ELIGIBLE',
        count,
        rate: percentOf(count, fromReached),
      }
    },
  )

  return {
    steps,
    dropOffs,
    notEligible: counts.NOT_ELIGIBLE,
    overallConversion: percentOf(
      reachedByStage.get('RECURRING_DONATION_ELIGIBLE') ?? 0,
      started,
    ),
  }
}
