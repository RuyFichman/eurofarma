import type { ContactChannel, ContactChannelSurface } from '@prisma/client'

import { prisma } from '../prisma'
import type { SourceUtm } from '../../utils/utm'
import type {
  ContactClickChannel,
  ContactClickSurface,
} from '../../validators/contact-click'

/**
 * Tradução do formato do fio (snake_case, minúsculo) para os enums do banco.
 * Os mapas são exaustivos por tipo: incluir um canal novo no validator sem
 * mapear aqui quebra o typecheck, não a gravação em produção.
 */
const CHANNEL_BY_INPUT: Record<ContactClickChannel, ContactChannel> = {
  whatsapp: 'WHATSAPP',
  phone: 'PHONE',
}

const SURFACE_BY_INPUT: Record<ContactClickSurface, ContactChannelSurface> = {
  coverage_result: 'COVERAGE_RESULT',
}

export type RecordContactChannelClickInput = {
  channel: ContactClickChannel
  surface: ContactClickSurface
  sourceUtm: SourceUtm | null
}

/**
 * Grava um clique em canal oficial do Lactare (RF07).
 *
 * Lista explícita de campos: o payload vem de um endpoint público, então nada
 * que não esteja aqui chega ao banco. Não existe coluna para nutriz, unidade,
 * CEP, IP ou referrer — o evento é anônimo por construção, não por filtro.
 */
export async function recordContactChannelClick(
  input: RecordContactChannelClickInput,
): Promise<{ id: string }> {
  return prisma.contactChannelClick.create({
    data: {
      channel: CHANNEL_BY_INPUT[input.channel],
      surface: SURFACE_BY_INPUT[input.surface],
      sourceUtm: input.sourceUtm ?? undefined,
    },
    select: { id: true },
  })
}
