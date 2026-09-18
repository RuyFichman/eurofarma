import {
  Prisma,
  type WhatsappInboundMessageProcessingResult,
  type WhatsappInboundMessageProvider,
} from '@prisma/client'

import { prisma } from '../prisma'

/**
 * Cria o registro de entrada antes dos efeitos do webhook. A restrição única
 * composta é o lock durável: somente a primeira entrega pode processar a
 * mensagem; reentregas retornam `claimed: false`.
 */
export async function claimWhatsappInboundMessage(params: {
  provider: WhatsappInboundMessageProvider
  providerMessageId: string
}): Promise<{ id: string; claimed: boolean }> {
  try {
    const message = await prisma.whatsappInboundMessage.create({
      data: {
        provider: params.provider,
        providerMessageId: params.providerMessageId,
      },
      select: { id: true },
    })
    return { id: message.id, claimed: true }
  } catch (error) {
    const isDuplicate =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    if (!isDuplicate) throw error

    const existing = await prisma.whatsappInboundMessage.findUnique({
      where: {
        provider_providerMessageId: {
          provider: params.provider,
          providerMessageId: params.providerMessageId,
        },
      },
      select: { id: true },
    })

    if (!existing) throw error
    return { id: existing.id, claimed: false }
  }
}

/** Registra o resultado sem persistir conteúdo ou PII da mensagem recebida. */
export async function finishWhatsappInboundMessage(params: {
  id: string
  result: Exclude<WhatsappInboundMessageProcessingResult, 'PROCESSING'>
  phoneWhatsapp?: string
}): Promise<void> {
  await prisma.whatsappInboundMessage.update({
    where: { id: params.id },
    data: {
      processingResult: params.result,
      processedAt: new Date(),
      ...(params.phoneWhatsapp
        ? {
            conversation: {
              connect: { phoneWhatsapp: params.phoneWhatsapp },
            },
          }
        : {}),
    },
  })
}
