import { z } from 'zod'

/**
 * Eventos de tracking aceitos por `POST /api/track`.
 *
 * Lista fechada de propósito: o endpoint é público e sem autenticação, então
 * só grava o que o próprio front dispara hoje (`unit-card-actions.tsx` e
 * `unit-detail-actions.tsx`, Sprint 3.5). Evento novo exige entrada aqui + uma
 * tabela que o comporte — não existe "evento genérico" no schema.
 */
export const TRACK_EVENTS = ['whatsapp_clicked'] as const

export type TrackEvent = (typeof TRACK_EVENTS)[number]

/** Limite defensivo do referrer — a coluna é texto livre vindo do navegador. */
const MAX_REFERRER_LENGTH = 500

/**
 * Payload do clique no WhatsApp, no formato **snake_case** que o cliente já
 * envia via `navigator.sendBeacon`.
 *
 * Campos aceitos mas **não persistidos** (`unit_slug`, `source`, `path`): o
 * modelo `WhatsappClick` não tem colunas para eles e esta sprint não altera o
 * schema. São declarados para documentar o contrato real; o Zod descarta as
 * chaves não declaradas.
 */
export const whatsappClickTrackSchema = z.object({
  event: z.literal('whatsapp_clicked', {
    errorMap: () => ({ message: 'Evento não suportado.' }),
  }),
  unit_id: z.string().uuid({ message: 'Unidade inválida.' }),
  /**
   * Sanitizado depois por `sanitizeSourceUtm` (mesma função do cadastro), que
   * aceita só as 5 chaves UTM e ignora o resto — inclusive os `null` que o
   * cliente manda quando a URL não tem UTM.
   */
  source_utm: z.unknown().optional(),
  referrer: z
    .string()
    .trim()
    .max(MAX_REFERRER_LENGTH)
    .nullish()
    .transform((value) => (value ? value : null)),
})

export type WhatsappClickTrackInput = z.infer<typeof whatsappClickTrackSchema>
