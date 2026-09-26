import { ACTION_CENTER_QUEUE_KEYS, type ActionCenterQueueKey } from './queues'
import {
  classifySeverity,
  maxSeverity,
  severityRank,
  type ActionCenterSeverity,
} from './severity'
import { ACTION_CENTER_THRESHOLDS } from './thresholds'
import { businessWaitMinutes, calendarWaitMinutes, medianOf } from './wait-time'

/** Resumo agregado de uma fila, sem nenhum dado pessoal. */
export type ActionCenterQueueSummary = {
  key: ActionCenterQueueKey
  count: number
  oldestWaitMinutes: number | null
  medianWaitMinutes: number | null
  /** `null` quando a fila está vazia. */
  severity: ActionCenterSeverity | null
}

/**
 * Resume uma fila medida em tempo corrido a partir do agregado do banco:
 * quantidade, item mais antigo e mediana. A criticidade da fila é a do item
 * mais antigo — a espera é monótona, então ele é sempre o mais crítico —
 * elevada por `minimumSeverity` quando uma regra complementar exige (ex.:
 * visita de entrega de kit já vencida).
 */
export function summarizeCalendarQueue(params: {
  key: Exclude<ActionCenterQueueKey, 'humanHandoff'>
  count: number
  oldestSince: Date | null
  medianWaitMinutes: number | null
  now: Date
  minimumSeverity?: ActionCenterSeverity | null
}): ActionCenterQueueSummary {
  const { key, count, oldestSince, now } = params
  if (count === 0 || !oldestSince) {
    return {
      key,
      count: 0,
      oldestWaitMinutes: null,
      medianWaitMinutes: null,
      severity: null,
    }
  }

  const oldestWaitMinutes = calendarWaitMinutes(oldestSince, now)
  let severity = classifySeverity(
    oldestWaitMinutes,
    ACTION_CENTER_THRESHOLDS[key],
  )
  if (params.minimumSeverity) {
    severity = maxSeverity(severity, params.minimumSeverity)
  }

  return {
    key,
    count,
    oldestWaitMinutes,
    medianWaitMinutes:
      params.medianWaitMinutes === null
        ? null
        : Math.max(0, Math.round(params.medianWaitMinutes)),
    severity,
  }
}

/**
 * Resume os pedidos de atendimento humano. A espera é contada em horário de
 * atendimento, que não se calcula com um simples `now - since` no SQL; por
 * isso o banco devolve só os instantes de início (sem telefone ou nome) e o
 * cálculo acontece aqui.
 */
export function summarizeHumanHandoffQueue(params: {
  count: number
  pausedSince: readonly Date[]
  now: Date
}): ActionCenterQueueSummary {
  const waits = params.pausedSince.map((since) =>
    businessWaitMinutes(since, params.now),
  )
  if (params.count === 0 || waits.length === 0) {
    return {
      key: 'humanHandoff',
      count: 0,
      oldestWaitMinutes: null,
      medianWaitMinutes: null,
      severity: null,
    }
  }

  const oldestWaitMinutes = Math.max(...waits)
  return {
    key: 'humanHandoff',
    count: params.count,
    oldestWaitMinutes,
    medianWaitMinutes: medianOf(waits),
    severity: classifySeverity(
      oldestWaitMinutes,
      ACTION_CENTER_THRESHOLDS.humanHandoff,
    ),
  }
}

/**
 * Filas com itens primeiro, por criticidade e depois pela espera mais longa.
 * Empates seguem a ordem fixa de `ACTION_CENTER_QUEUE_KEYS`. As filas vazias
 * vão para `clear`, exibidas numa única linha de "tudo em dia".
 */
export function orderQueueSummaries(
  summaries: readonly ActionCenterQueueSummary[],
): {
  active: ActionCenterQueueSummary[]
  clear: ActionCenterQueueSummary[]
} {
  const position = (key: ActionCenterQueueKey) =>
    ACTION_CENTER_QUEUE_KEYS.indexOf(key)

  const active = summaries
    .filter((summary) => summary.count > 0 && summary.severity !== null)
    .sort((a, b) => {
      const bySeverity =
        severityRank(b.severity ?? 'low') - severityRank(a.severity ?? 'low')
      if (bySeverity !== 0) return bySeverity
      const byWait = (b.oldestWaitMinutes ?? 0) - (a.oldestWaitMinutes ?? 0)
      if (byWait !== 0) return byWait
      return position(a.key) - position(b.key)
    })

  const clear = summaries
    .filter((summary) => summary.count === 0 || summary.severity === null)
    .sort((a, b) => position(a.key) - position(b.key))

  return { active, clear }
}
