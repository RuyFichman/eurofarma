import type { ActionCenterQueueThresholds } from './thresholds'

/**
 * Criticidade operacional de um item ou fila. Deriva só do tempo de espera —
 * nunca de dado clínico, resultado de exame ou avaliação de aptidão.
 */
export const ACTION_CENTER_SEVERITIES = ['high', 'medium', 'low'] as const

export type ActionCenterSeverity = (typeof ACTION_CENTER_SEVERITIES)[number]

const SEVERITY_RANK: Record<ActionCenterSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export function severityRank(severity: ActionCenterSeverity): number {
  return SEVERITY_RANK[severity]
}

export function maxSeverity(
  a: ActionCenterSeverity,
  b: ActionCenterSeverity,
): ActionCenterSeverity {
  return severityRank(a) >= severityRank(b) ? a : b
}

/**
 * Classifica uma espera já medida no relógio da fila (corrido ou comercial).
 * Os cortes são inclusivos: esperar exatamente `mediumMinutes` já é "média".
 */
export function classifySeverity(
  waitMinutes: number,
  thresholds: Pick<
    ActionCenterQueueThresholds,
    'mediumMinutes' | 'highMinutes'
  >,
): ActionCenterSeverity {
  if (thresholds.highMinutes !== null && waitMinutes >= thresholds.highMinutes)
    return 'high'
  if (waitMinutes >= thresholds.mediumMinutes) return 'medium'
  return 'low'
}
