import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'

const mocks = vi.hoisted(() => ({
  nutrizFindFirst: vi.fn(),
  nutrizCreate: vi.fn(),
  conversationFindUnique: vi.fn(),
  conversationUpsert: vi.fn(),
}))

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    nutrizProfile: {
      findFirst: mocks.nutrizFindFirst,
      create: mocks.nutrizCreate,
    },
    whatsappConversation: {
      findUnique: mocks.conversationFindUnique,
      upsert: mocks.conversationUpsert,
    },
  },
}))

import {
  createWhatsappNutrizLead,
  findNutrizByWhatsapp,
  getConversationState,
  saveConversationState,
} from '../../lib/db/queries/whatsapp-conversations'

describe('persistência da conversa do WhatsApp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carrega somente a decisão mais recente de lembretes da nutriz', async () => {
    mocks.nutrizFindFirst.mockResolvedValue({
      id: 'profile-1',
      fullName: 'Maria da Silva',
      journeyStatus: 'REGISTERED',
      communicationConsents: [{ decision: 'GRANTED' }],
    })

    await expect(findNutrizByWhatsapp('5511999998888')).resolves.toEqual({
      id: 'profile-1',
      fullName: 'Maria da Silva',
      journeyStatus: 'REGISTERED',
      reminderConsentEnabled: true,
    })
    expect(mocks.nutrizFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          communicationConsents: {
            where: { purpose: 'REMINDERS_WHATSAPP' },
            orderBy: { sequence: 'desc' },
            take: 1,
            select: { decision: true },
          },
        }),
      }),
    )
  })

  it('reidrata somente cidade e UF e descarta nome, CEP ou campos extras', async () => {
    mocks.conversationFindUnique.mockResolvedValue({
      step: 'AWAITING_CONSENT',
      context: {
        fullName: 'Maria da Silva',
        location: { city: 'Osasco', state: 'SP', cep: '06000000' },
        cep: '06000000',
        clinicalNotes: 'não pode persistir',
      },
      misunderstoodCount: 1,
    })

    const state = await getConversationState('5511999998888')
    expect(state).toEqual({
      step: 'AWAITING_CONSENT',
      context: {
        location: { city: 'Osasco', state: 'SP' },
      },
      misunderstoodCount: 1,
      isNewConversation: false,
    })
    expect(JSON.stringify(state)).not.toContain('06000000')
    expect(JSON.stringify(state)).not.toContain('Maria da Silva')
    expect(JSON.stringify(state)).not.toContain('clinicalNotes')
  })

  it('grava o estado ativo sem tocar no rascunho de agendamento legado', async () => {
    mocks.conversationUpsert.mockResolvedValue({})
    await saveConversationState({
      phoneWhatsapp: '5511999998888',
      nutrizProfileId: null,
      step: 'AWAITING_FULL_NAME',
      context: { location: { city: 'Osasco', state: 'SP' } },
      misunderstoodCount: 0,
    })

    const call = mocks.conversationUpsert.mock.calls[0]?.[0]
    expect(call).toMatchObject({
      where: { phoneWhatsapp: '5511999998888' },
      update: {
        step: 'AWAITING_FULL_NAME',
        context: { location: { city: 'Osasco', state: 'SP' } },
        misunderstoodCount: 0,
        nutrizProfileId: null,
      },
    })
    expect(call.update).not.toHaveProperty('draftScheduledAt')
  })

  it('limpa o contexto como NULL de banco, compatível com a restrição SQL', async () => {
    mocks.conversationUpsert.mockResolvedValue({})
    await saveConversationState({
      phoneWhatsapp: '5511999998888',
      nutrizProfileId: null,
      step: 'MENU',
      context: {},
      misunderstoodCount: 0,
    })

    expect(mocks.conversationUpsert.mock.calls[0]?.[0].update.context).toBe(
      Prisma.DbNull,
    )
  })

  it('cria lead mínimo com consentimento e sem opt-in implícito', async () => {
    mocks.nutrizFindFirst.mockResolvedValue(null)
    mocks.nutrizCreate.mockResolvedValue({
      id: 'profile-1',
      fullName: 'Maria da Silva',
      journeyStatus: 'REGISTERED',
    })

    const created = await createWhatsappNutrizLead({
      phoneWhatsapp: '5511999998888',
      fullName: 'Maria da Silva',
      city: 'Osasco',
      state: 'SP',
    })

    expect(created?.id).toBe('profile-1')
    expect(created?.reminderConsentEnabled).toBe(false)
    expect(mocks.nutrizCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fullName: 'Maria da Silva',
        phoneWhatsapp: '5511999998888',
        city: 'Osasco',
        state: 'SP',
        interestStatus: 'INTERESTED',
        contactPreference: 'WHATSAPP',
        marketingConsent: false,
        sourceUtm: {
          utm_source: 'whatsapp',
          utm_medium: 'chatbot',
        },
        lgpdConsentAt: expect.any(Date),
      }),
      select: { id: true, fullName: true, journeyStatus: true },
    })
  })
})
