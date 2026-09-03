import { WHATSAPP_BOT } from '../i18n/pt-br'
import { formatLongDate, formatTime } from '../utils/format-date'
import { parseScheduleInput } from './parse-schedule'

/**
 * Máquina de estados da conversa do chatbot.
 *
 * É uma **função pura**: recebe o passo atual, o rascunho e a mensagem, e
 * devolve o que responder, para onde ir e o que gravar. Quem grava e envia é o
 * route handler. Essa separação é o que torna o fluxo inteiro testável sem
 * Meta, sem rede e sem banco — e o fluxo é a parte que mais vai mudar quando o
 * time ouvir as primeiras conversas reais.
 *
 * Prisma-free: passo, status e motivo trafegam como string literal.
 */

export type ConversationStep =
  | 'ASKED_SCHEDULED'
  | 'AWAITING_DATE'
  | 'AWAITING_DATE_CONFIRMATION'
  | 'AWAITING_FAILURE_REASON'
  | 'FINISHED'

export type FailureReason =
  | 'NO_ANSWER'
  | 'NO_SLOT'
  | 'TOO_FAR'
  | 'GAVE_UP'
  | 'OTHER'

/** Ids dos botões e itens de lista. Não são copy — a Meta os devolve crus. */
export const REPLY_IDS = {
  scheduledYes: 'agendou_sim',
  scheduledNo: 'agendou_nao',
  dateOk: 'data_ok',
  dateFix: 'data_corrigir',
  reasonPrefix: 'motivo_',
} as const

const REASON_BY_ID: Record<string, FailureReason> = {
  [`${REPLY_IDS.reasonPrefix}nao_atendeu`]: 'NO_ANSWER',
  [`${REPLY_IDS.reasonPrefix}sem_vaga`]: 'NO_SLOT',
  [`${REPLY_IDS.reasonPrefix}longe`]: 'TOO_FAR',
  [`${REPLY_IDS.reasonPrefix}depois`]: 'GAVE_UP',
  [`${REPLY_IDS.reasonPrefix}outro`]: 'OTHER',
}

export type BotReply =
  | { type: 'text'; body: string }
  | {
      type: 'buttons'
      body: string
      buttons: ReadonlyArray<{ id: string; title: string }>
    }
  | {
      type: 'list'
      body: string
      button: string
      rows: ReadonlyArray<{ id: string; title: string }>
    }

export type ConversationEffect =
  | { kind: 'none' }
  | { kind: 'save_scheduled'; scheduledAt: Date }
  | { kind: 'save_not_scheduled'; reason: FailureReason }

export type ConversationOutcome = {
  reply: BotReply
  nextStep: ConversationStep
  draftScheduledAt: Date | null
  effect: ConversationEffect
}

/** Pergunta inicial — também é o reinício depois de um fluxo concluído. */
export function buildAskScheduledReply(): BotReply {
  return {
    type: 'buttons',
    body: WHATSAPP_BOT.askScheduled.body,
    buttons: [
      { id: REPLY_IDS.scheduledYes, title: WHATSAPP_BOT.askScheduled.yes },
      { id: REPLY_IDS.scheduledNo, title: WHATSAPP_BOT.askScheduled.no },
    ],
  }
}

/**
 * Lista (e não botões) porque são **cinco** motivos: a Meta aceita no máximo
 * três botões de resposta, e uma lista comporta até dez itens.
 */
function buildAskReasonReply(): BotReply {
  const options = WHATSAPP_BOT.askFailureReason.options
  return {
    type: 'list',
    body: WHATSAPP_BOT.askFailureReason.body,
    button: WHATSAPP_BOT.askFailureReason.button,
    rows: [
      { id: `${REPLY_IDS.reasonPrefix}nao_atendeu`, title: options.NO_ANSWER },
      { id: `${REPLY_IDS.reasonPrefix}sem_vaga`, title: options.NO_SLOT },
      { id: `${REPLY_IDS.reasonPrefix}longe`, title: options.TOO_FAR },
      { id: `${REPLY_IDS.reasonPrefix}depois`, title: options.GAVE_UP },
      { id: `${REPLY_IDS.reasonPrefix}outro`, title: options.OTHER },
    ],
  }
}

function buildConfirmDateReply(scheduledAt: Date): BotReply {
  const body = WHATSAPP_BOT.confirmDate.bodyTemplate
    .replace('{date}', formatLongDate(scheduledAt))
    .replace('{time}', formatTime(scheduledAt))

  return {
    type: 'buttons',
    body,
    buttons: [
      { id: REPLY_IDS.dateOk, title: WHATSAPP_BOT.confirmDate.yes },
      { id: REPLY_IDS.dateFix, title: WHATSAPP_BOT.confirmDate.no },
    ],
  }
}

function askScheduledAgain(): ConversationOutcome {
  return {
    reply: buildAskScheduledReply(),
    nextStep: 'ASKED_SCHEDULED',
    draftScheduledAt: null,
    effect: { kind: 'none' },
  }
}

/**
 * Avança a conversa um passo.
 *
 * Regra que atravessa todos os ramos: resposta que não encaixa **repete a
 * pergunta** em vez de encerrar. Quem está do outro lado pode ter mandado um
 * áudio, uma figurinha ou um "oi" solto, e derrubar a conversa por isso a
 * obrigaria a recomeçar do zero.
 */
export function advanceConversation(params: {
  step: ConversationStep
  draftScheduledAt: Date | null
  text: string | null
  replyId: string | null
  now?: Date
}): ConversationOutcome {
  const { step, draftScheduledAt, text, replyId } = params
  const now = params.now ?? new Date()

  switch (step) {
    case 'ASKED_SCHEDULED': {
      if (replyId === REPLY_IDS.scheduledYes) {
        return {
          reply: { type: 'text', body: WHATSAPP_BOT.askDate.body },
          nextStep: 'AWAITING_DATE',
          draftScheduledAt: null,
          effect: { kind: 'none' },
        }
      }
      if (replyId === REPLY_IDS.scheduledNo) {
        return {
          reply: buildAskReasonReply(),
          nextStep: 'AWAITING_FAILURE_REASON',
          draftScheduledAt: null,
          effect: { kind: 'none' },
        }
      }
      return askScheduledAgain()
    }

    case 'AWAITING_DATE': {
      const parsed = text ? parseScheduleInput(text, now) : null
      if (!parsed) {
        return {
          reply: { type: 'text', body: WHATSAPP_BOT.dateNotUnderstood.body },
          nextStep: 'AWAITING_DATE',
          draftScheduledAt: null,
          effect: { kind: 'none' },
        }
      }
      return {
        reply: buildConfirmDateReply(parsed),
        nextStep: 'AWAITING_DATE_CONFIRMATION',
        draftScheduledAt: parsed,
        effect: { kind: 'none' },
      }
    }

    case 'AWAITING_DATE_CONFIRMATION': {
      if (replyId === REPLY_IDS.dateFix) {
        return {
          reply: { type: 'text', body: WHATSAPP_BOT.askDate.body },
          nextStep: 'AWAITING_DATE',
          draftScheduledAt: null,
          effect: { kind: 'none' },
        }
      }
      if (replyId === REPLY_IDS.dateOk && draftScheduledAt) {
        return {
          // O corpo final depende da URL da área, que o handler injeta.
          reply: {
            type: 'text',
            body: WHATSAPP_BOT.scheduledSaved.bodyTemplate,
          },
          nextStep: 'FINISHED',
          draftScheduledAt: null,
          effect: { kind: 'save_scheduled', scheduledAt: draftScheduledAt },
        }
      }
      // Confirmou sem rascunho (estado impossível na prática, mas o banco é
      // compartilhado com outro processo): volta a pedir a data em vez de gravar.
      if (replyId === REPLY_IDS.dateOk) {
        return {
          reply: { type: 'text', body: WHATSAPP_BOT.askDate.body },
          nextStep: 'AWAITING_DATE',
          draftScheduledAt: null,
          effect: { kind: 'none' },
        }
      }
      return {
        reply: draftScheduledAt
          ? buildConfirmDateReply(draftScheduledAt)
          : { type: 'text', body: WHATSAPP_BOT.askDate.body },
        nextStep: draftScheduledAt
          ? 'AWAITING_DATE_CONFIRMATION'
          : 'AWAITING_DATE',
        draftScheduledAt,
        effect: { kind: 'none' },
      }
    }

    case 'AWAITING_FAILURE_REASON': {
      const reason = replyId ? REASON_BY_ID[replyId] : undefined
      if (!reason) {
        return {
          reply: buildAskReasonReply(),
          nextStep: 'AWAITING_FAILURE_REASON',
          draftScheduledAt: null,
          effect: { kind: 'none' },
        }
      }
      return {
        reply: {
          type: 'text',
          body: WHATSAPP_BOT.notScheduledSaved.bodyTemplate,
        },
        nextStep: 'FINISHED',
        draftScheduledAt: null,
        effect: { kind: 'save_not_scheduled', reason },
      }
    }

    case 'FINISHED':
      // Mensagem nova depois de concluído recomeça o fluxo: é assim que ela
      // informa um agendamento seguinte, ou corrige o que contou antes.
      return askScheduledAgain()
  }
}
