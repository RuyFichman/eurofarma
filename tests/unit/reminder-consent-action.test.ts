import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireNutrizUser: vi.fn(),
  setReminderConsent: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('../../lib/auth/get-nutriz-user', () => ({
  requireNutrizUser: mocks.requireNutrizUser,
}))
vi.mock('../../lib/db/queries/communication-consents', () => ({
  setReminderConsent: mocks.setReminderConsent,
}))
vi.mock('../../lib/db/queries/appointments', () => ({
  cancelNutrizAppointment: vi.fn(),
}))
vi.mock('../../lib/auth/supabase-server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

import { setReminderConsentAction } from '../../app/(public)/meu-agendamento/actions'

describe('ação da preferência de lembretes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireNutrizUser.mockResolvedValue({ id: 'profile-1' })
  })

  it('registra opt-in web somente para a nutriz autenticada', async () => {
    mocks.setReminderConsent.mockResolvedValue({
      status: 'UPDATED',
      enabled: true,
    })

    await expect(setReminderConsentAction(true)).resolves.toEqual({
      ok: true,
      enabled: true,
    })
    expect(mocks.requireNutrizUser).toHaveBeenCalledOnce()
    expect(mocks.setReminderConsent).toHaveBeenCalledWith({
      nutrizProfileId: 'profile-1',
      enabled: true,
      source: 'WEB',
    })
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/meu-agendamento')
  })

  it('registra o cancelamento pelo mesmo fluxo', async () => {
    mocks.setReminderConsent.mockResolvedValue({
      status: 'UPDATED',
      enabled: false,
    })

    await expect(setReminderConsentAction(false)).resolves.toEqual({
      ok: true,
      enabled: false,
    })
    expect(mocks.setReminderConsent).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    )
  })

  it('não confirma alteração quando o perfil não está mais ativo', async () => {
    mocks.setReminderConsent.mockResolvedValue({
      status: 'NOT_FOUND',
      enabled: false,
    })

    await expect(setReminderConsentAction(true)).resolves.toEqual({
      ok: false,
      enabled: false,
    })
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })
})
