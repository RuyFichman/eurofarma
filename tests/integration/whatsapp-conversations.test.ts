import { describe, it, expect } from 'vitest'

import {
  createDeclaredAppointment,
  createNotScheduledAppointment,
  findNutrizByWhatsapp,
  getConversationState,
  saveConversationState,
} from '../../lib/db/queries/whatsapp-conversations'
import { getCurrentNutrizAppointment } from '../../lib/db/queries/appointments'
import { createTestNutrizProfile } from '../helpers/factories'
import { prisma } from '../../lib/db/prisma'

/** Número de teste com nono dígito, fora de qualquer faixa real usada no seed. */
function testWhatsapp(suffix: string): string {
  return `55119${suffix.padStart(8, '0')}`
}

describe('findNutrizByWhatsapp', () => {
  it('encontra pelo número exato', async () => {
    const phone = testWhatsapp('70000001')
    const nutriz = await createTestNutrizProfile({ phoneWhatsapp: phone })
    expect((await findNutrizByWhatsapp(phone))?.id).toBe(nutriz.id)
  })

  /**
   * O caso que motiva `buildBrazilianWhatsappCandidates`: a nutriz cadastrou
   * com o nono dígito e a Meta entrega sem ele.
   */
  it('encontra quando a Meta entrega sem o nono dígito', async () => {
    const withNinth = testWhatsapp('70000002')
    const withoutNinth = `55${withNinth.slice(2, 4)}${withNinth.slice(5)}`
    const nutriz = await createTestNutrizProfile({ phoneWhatsapp: withNinth })

    expect((await findNutrizByWhatsapp(withoutNinth))?.id).toBe(nutriz.id)
  })

  it('não encontra número desconhecido', async () => {
    expect(await findNutrizByWhatsapp('5511900000000')).toBeNull()
  })

  /** Quem pediu exclusão não volta a ter agendamento gravado. */
  it('ignora nutriz com soft delete', async () => {
    const phone = testWhatsapp('70000003')
    await createTestNutrizProfile({
      phoneWhatsapp: phone,
      deletedAt: new Date(),
    })
    expect(await findNutrizByWhatsapp(phone)).toBeNull()
  })
})

describe('estado da conversa', () => {
  it('número novo começa perguntando', async () => {
    const state = await getConversationState(testWhatsapp('70000004'))
    expect(state.step).toBe('ASKED_SCHEDULED')
    expect(state.draftScheduledAt).toBeNull()
  })

  it('grava e relê o passo com o rascunho', async () => {
    const phone = testWhatsapp('70000005')
    const nutriz = await createTestNutrizProfile({ phoneWhatsapp: phone })
    const draft = new Date('2026-06-05T12:30:00.000Z')

    await saveConversationState({
      phoneWhatsapp: phone,
      nutrizProfileId: nutriz.id,
      step: 'AWAITING_DATE_CONFIRMATION',
      draftScheduledAt: draft,
    })

    const state = await getConversationState(phone)
    expect(state.step).toBe('AWAITING_DATE_CONFIRMATION')
    expect(state.draftScheduledAt?.toISOString()).toBe(draft.toISOString())
  })

  it('atualiza a conversa existente em vez de duplicar', async () => {
    const phone = testWhatsapp('70000006')
    const nutriz = await createTestNutrizProfile({ phoneWhatsapp: phone })

    await saveConversationState({
      phoneWhatsapp: phone,
      nutrizProfileId: nutriz.id,
      step: 'AWAITING_DATE',
      draftScheduledAt: null,
    })
    await saveConversationState({
      phoneWhatsapp: phone,
      nutrizProfileId: nutriz.id,
      step: 'FINISHED',
      draftScheduledAt: null,
    })

    expect(
      await prisma.whatsappConversation.count({
        where: { phoneWhatsapp: phone },
      }),
    ).toBe(1)
    expect((await getConversationState(phone)).step).toBe('FINISHED')
  })
})

describe('gravação do agendamento a partir do bot', () => {
  it('grava a visita informada e ela aparece na tela da nutriz', async () => {
    const nutriz = await createTestNutrizProfile()
    const scheduledAt = new Date(Date.now() + 5 * 24 * 3600 * 1000)

    const created = await createDeclaredAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt,
    })
    expect(created?.reference).toMatch(/^AGD-\d{4}-\d{5}$/)

    const shown = await getCurrentNutrizAppointment(nutriz.id)
    expect(shown?.id).toBe(created?.id)
    expect(shown?.status).toBe('DECLARED')
    expect(shown?.isUpcoming).toBe(true)
  })

  it('grava o "não consegui agendar" com o motivo', async () => {
    const nutriz = await createTestNutrizProfile()

    const created = await createNotScheduledAppointment({
      nutrizProfileId: nutriz.id,
      reason: 'NO_SLOT',
    })
    expect(created).not.toBeNull()

    const shown = await getCurrentNutrizAppointment(nutriz.id)
    expect(shown?.status).toBe('NOT_SCHEDULED')
    expect(shown?.failureReason).toBe('NO_SLOT')
    expect(shown?.scheduledAt).toBeNull()
  })

  it('gera referências distintas', async () => {
    const nutriz = await createTestNutrizProfile()
    const first = await createDeclaredAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
    })
    const second = await createDeclaredAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: new Date(Date.now() + 4 * 24 * 3600 * 1000),
    })
    expect(first?.reference).not.toBe(second?.reference)
  })
})
