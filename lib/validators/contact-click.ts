import { z } from 'zod'

/**
 * Evento do RF07: clique em um canal oficial do Lactare.
 *
 * O formato do fio é **snake_case** porque o cliente envia por
 * `navigator.sendBeacon`, sem passar por Server Action. Nome único e literal
 * de propósito: o endpoint é público e sem autenticação, então nada de
 * "evento genérico" — evento novo exige entrada aqui e uma coluna que o
 * comporte.
 *
 * Este evento **não substitui** `whatsappClickTrackSchema` (legado de unidades,
 * cuja rota responde 410): ele nasce sem `unit_id` e sem referrer.
 */
export const CONTACT_CLICK_EVENT = 'lactare_contact_clicked' as const

/** Canais publicados em `lib/constants/lactare-contact.ts`. */
export const CONTACT_CHANNELS = ['whatsapp', 'phone'] as const

/** Telas que hoje exibem os canais oficiais. */
export const CONTACT_SURFACES = ['coverage_result'] as const

export type ContactClickChannel = (typeof CONTACT_CHANNELS)[number]
export type ContactClickSurface = (typeof CONTACT_SURFACES)[number]

export const contactClickSchema = z.object({
  event: z.literal(CONTACT_CLICK_EVENT, {
    errorMap: () => ({ message: 'Evento não suportado.' }),
  }),
  channel: z.enum(CONTACT_CHANNELS, {
    errorMap: () => ({ message: 'Canal não suportado.' }),
  }),
  surface: z.enum(CONTACT_SURFACES, {
    errorMap: () => ({ message: 'Origem do clique não suportada.' }),
  }),
  /**
   * Sanitizado depois por `sanitizeSourceUtm` (mesma função do cadastro), que
   * aceita só as 5 chaves UTM e descarta o resto — inclusive os `null` que o
   * navegador manda quando a URL não tem campanha.
   */
  source_utm: z.unknown().optional(),
})

export type ContactClickInput = z.infer<typeof contactClickSchema>
