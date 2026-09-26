/**
 * Limites operacionais da Central de Ação do painel.
 *
 * **Provisórios, pendentes de validação com a equipe do Lactare.** Foram
 * propostos em 26/09/2026 como ponto de partida e aceitos pelo time com essa
 * ressalva; nenhum deles vem de protocolo do Lactare. Ajustar aqui — nunca
 * dentro das consultas, que recebem estes valores como parâmetro.
 *
 * Todos os valores estão em minutos para que classificação, SQL e testes usem
 * uma única unidade. A criticidade deriva **somente** do tempo de espera e do
 * status categórico: nada aqui avalia exame, saúde ou aptidão.
 *
 * - `entryMinutes`: a partir de quanto tempo um item entra na fila.
 * - `mediumMinutes` / `highMinutes`: cortes de criticidade. Abaixo de
 *   `mediumMinutes` o item está na fila com criticidade baixa. `highMinutes`
 *   nulo significa que a fila nunca chega a "alta" — usado quando o item é um
 *   convite, não um problema.
 * - `clock`: `calendar` conta o tempo corrido; `business` conta apenas a janela
 *   de atendimento humano do Lactare (segunda a sábado, 9h–18h, Brasília).
 */

const HOUR = 60
const DAY = 24 * HOUR

export type ActionCenterClock = 'calendar' | 'business'

export type ActionCenterQueueThresholds = {
  clock: ActionCenterClock
  entryMinutes: number
  mediumMinutes: number
  highMinutes: number | null
}

export const ACTION_CENTER_THRESHOLDS = {
  /** Conversa pausada à espera da equipe; conta só horário de atendimento. */
  humanHandoff: {
    clock: 'business',
    entryMinutes: 0,
    mediumMinutes: 2 * HOUR,
    highMinutes: 4 * HOUR,
  },
  /** Etapas até o exame sem nenhuma mudança registrada. */
  noProgress: {
    clock: 'calendar',
    entryMinutes: 14 * DAY,
    mediumMinutes: 21 * DAY,
    highMinutes: 30 * DAY,
  },
  /** Kit marcado como enviado sem a entrega registrada. */
  kitNotDelivered: {
    clock: 'calendar',
    entryMinutes: 7 * DAY,
    mediumMinutes: 10 * DAY,
    highMinutes: 14 * DAY,
  },
  /** Falhas técnicas de envio; qualquer falha já nasce com criticidade média. */
  deliveryFailures: {
    clock: 'calendar',
    entryMinutes: 0,
    mediumMinutes: 0,
    highMinutes: 24 * HOUR,
  },
  /** Kit entregue sem nenhuma doação registrada pelo Lactare. */
  firstDonation: {
    clock: 'calendar',
    entryMinutes: 21 * DAY,
    mediumMinutes: 30 * DAY,
    highMinutes: 45 * DAY,
  },
  /** Convite a retomar contato; por isso nunca chega a "alta". */
  returningDonors: {
    clock: 'calendar',
    entryMinutes: 60 * DAY,
    mediumMinutes: 90 * DAY,
    highMinutes: null,
  },
} as const satisfies Record<string, ActionCenterQueueThresholds>

/**
 * Regras complementares, também provisórias, que não são cortes de tempo de
 * espera de uma fila.
 */
export const ACTION_CENTER_RULES = {
  /**
   * Um kit cuja visita informada pelo admin já passou há mais que isto entra
   * na fila mesmo antes de `kitNotDelivered.entryMinutes` e sobe para, no
   * mínimo, criticidade média.
   */
  kitVisitOverdueMinutes: 1 * DAY,
  /**
   * Falhas técnicas não têm estado "resolvida"; sem uma janela, a fila nunca
   * esvaziaria. Só entram as ocorridas nos últimos sete dias.
   */
  deliveryFailureLookbackMinutes: 7 * DAY,
  /**
   * Mensagem recebida que ficou em `PROCESSING` por mais que isto indica que o
   * processamento foi interrompido no meio.
   */
  inboundStuckProcessingMinutes: 15,
  /** Itens por página no detalhamento de cada fila. */
  pageSize: 20,
} as const
