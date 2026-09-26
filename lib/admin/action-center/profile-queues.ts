import type { JourneyStatusValue } from '../../journey/status'
import type { ActionCenterQueueKey } from './queues'

export type ProfileQueueKey = Extract<
  ActionCenterQueueKey,
  'noProgress' | 'kitNotDelivered' | 'firstDonation' | 'returningDonors'
>

/**
 * Status categórico atual de cada fila de nutrizes. As listas são disjuntas:
 * uma nutriz aparece no máximo em uma fila de jornada, pela etapa em que está.
 *
 * - `noProgress` cobre as etapas até o exame, incluindo valores legados que o
 *   painel não oferece mais, para perfis antigos não ficarem invisíveis.
 * - `firstDonation` inclui o legado `ELIGIBLE` pelo mesmo motivo.
 * - `NOT_ELIGIBLE` fica fora de todas: é uma saída legítima registrada pelo
 *   Lactare, não uma pendência.
 */
export const PROFILE_QUEUE_STATUSES = {
  noProgress: [
    'REGISTERED',
    'DOCUMENT_SENT',
    'FORM_RECEIVED',
    'EXAM_SCHEDULED',
    'EXAMS_COMPLETED',
    'AWAITING_RESULT',
  ],
  kitNotDelivered: ['KIT_SENT'],
  firstDonation: ['KIT_DELIVERED', 'ELIGIBLE'],
  returningDonors: ['DONATION_CONFIRMED', 'RECURRING_DONATION_ELIGIBLE'],
} as const satisfies Record<ProfileQueueKey, readonly JourneyStatusValue[]>

/** Status que nunca geram pendência na Central de Ação. */
export const PROFILE_QUEUE_EXCLUDED_STATUSES = [
  'NOT_ELIGIBLE',
] as const satisfies readonly JourneyStatusValue[]

/**
 * Categorias técnicas da fila de falhas. Nenhuma carrega corpo de mensagem,
 * telefone ou outro dado pessoal — só a origem da falha e o código técnico.
 */
export const DELIVERY_FAILURE_CATEGORIES = [
  /** Aviso ou lembrete da outbox que esgotou as tentativas. */
  'OUTBOX_FAILED',
  /** Callback do provedor informou falha ou não entrega. */
  'PROVIDER_UNDELIVERED',
  /** A resposta do chatbot a uma mensagem recebida não foi enviada. */
  'CHATBOT_REPLY_NOT_SENT',
  /** Erro ao processar uma mensagem recebida, antes da resposta. */
  'INBOUND_PROCESSING_FAILED',
  /** Mensagem recebida cujo processamento foi interrompido no meio. */
  'INBOUND_STUCK',
] as const

export type DeliveryFailureCategory =
  (typeof DELIVERY_FAILURE_CATEGORIES)[number]
