import { describe, it, expect } from 'vitest'

import {
  cancelNutrizAppointment,
  getCurrentNutrizAppointment,
} from '../../lib/db/queries/appointments'
import {
  createTestAppointment,
  createTestNutrizProfile,
  createTestUnit,
} from '../helpers/factories'

/** Datas relativas ao agora, para os testes não dependerem do calendário. */
function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

/**
 * O isolamento aqui é natural: toda consulta é por `nutrizProfileId`, e cada
 * teste cria a própria nutriz. O cleanup do `tests/setup.ts` remove o
 * agendamento antes do perfil — a FK é RESTRICT.
 */
describe('getCurrentNutrizAppointment', () => {
  it('devolve null quando a nutriz não tem agendamento', async () => {
    const nutriz = await createTestNutrizProfile()
    expect(await getCurrentNutrizAppointment(nutriz.id)).toBeNull()
  })

  it('devolve a próxima visita marcada e a marca como futura', async () => {
    const nutriz = await createTestNutrizProfile()
    const unit = await createTestUnit()
    const scheduledAt = daysFromNow(3)
    await createTestAppointment({
      nutrizProfileId: nutriz.id,
      unitId: unit.id,
      scheduledAt,
    })

    const result = await getCurrentNutrizAppointment(nutriz.id)
    expect(result?.status).toBe('DECLARED')
    expect(result?.isUpcoming).toBe(true)
    expect(result?.scheduledAt?.getTime()).toBe(scheduledAt.getTime())
    expect(result?.unit?.id).toBe(unit.id)
  })

  it('escolhe a visita mais próxima entre várias futuras', async () => {
    const nutriz = await createTestNutrizProfile()
    await createTestAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: daysFromNow(20),
    })
    const soonest = await createTestAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: daysFromNow(2),
    })

    const result = await getCurrentNutrizAppointment(nutriz.id)
    expect(result?.id).toBe(soonest.id)
  })

  /**
   * É a razão de a consulta ser feita em dois passos: "não consegui agendar"
   * tem `scheduledAt` nulo, e um `order by scheduled_at desc` no Postgres põe
   * nulo primeiro — ele passaria na frente de uma visita real.
   */
  it('prefere a visita futura ao registro de "não consegui agendar"', async () => {
    const nutriz = await createTestNutrizProfile()
    await createTestAppointment({
      nutrizProfileId: nutriz.id,
      status: 'NOT_SCHEDULED',
      failureReason: 'NO_SLOT',
      scheduledAt: null,
      declaredAt: new Date(),
    })
    const upcoming = await createTestAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: daysFromNow(5),
      declaredAt: new Date(Date.now() - 60_000),
    })

    const result = await getCurrentNutrizAppointment(nutriz.id)
    expect(result?.id).toBe(upcoming.id)
  })

  it('cai no registro mais recente quando não há visita futura', async () => {
    const nutriz = await createTestNutrizProfile()
    await createTestAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: daysFromNow(-10),
      declaredAt: new Date(Date.now() - 120_000),
    })
    const latest = await createTestAppointment({
      nutrizProfileId: nutriz.id,
      status: 'NOT_SCHEDULED',
      failureReason: 'NO_ANSWER',
      declaredAt: new Date(),
    })

    const result = await getCurrentNutrizAppointment(nutriz.id)
    expect(result?.id).toBe(latest.id)
    expect(result?.failureReason).toBe('NO_ANSWER')
    expect(result?.isUpcoming).toBe(false)
  })

  it('marca visita passada como não futura', async () => {
    const nutriz = await createTestNutrizProfile()
    await createTestAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: daysFromNow(-1),
    })

    const result = await getCurrentNutrizAppointment(nutriz.id)
    expect(result?.isUpcoming).toBe(false)
  })

  it('aceita agendamento sem unidade', async () => {
    const nutriz = await createTestNutrizProfile()
    await createTestAppointment({
      nutrizProfileId: nutriz.id,
      unitId: null,
      scheduledAt: daysFromNow(4),
    })

    const result = await getCurrentNutrizAppointment(nutriz.id)
    expect(result?.unit).toBeNull()
    expect(result?.unitIsActive).toBe(false)
  })

  it('não expõe agendamento de outra nutriz', async () => {
    const dona = await createTestNutrizProfile()
    const outra = await createTestNutrizProfile()
    await createTestAppointment({
      nutrizProfileId: dona.id,
      scheduledAt: daysFromNow(3),
    })

    expect(await getCurrentNutrizAppointment(outra.id)).toBeNull()
  })
})

describe('cancelNutrizAppointment', () => {
  it('cancela o agendamento da própria nutriz', async () => {
    const nutriz = await createTestNutrizProfile()
    const appointment = await createTestAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: daysFromNow(3),
    })

    const cancelled = await cancelNutrizAppointment({
      appointmentId: appointment.id,
      nutrizProfileId: nutriz.id,
    })
    expect(cancelled).toBe(true)

    const result = await getCurrentNutrizAppointment(nutriz.id)
    expect(result?.status).toBe('CANCELLED')
    expect(result?.cancelledAt).not.toBeNull()
  })

  it('não cancela agendamento de outra nutriz', async () => {
    const dona = await createTestNutrizProfile()
    const invasora = await createTestNutrizProfile()
    const appointment = await createTestAppointment({
      nutrizProfileId: dona.id,
      scheduledAt: daysFromNow(3),
    })

    const cancelled = await cancelNutrizAppointment({
      appointmentId: appointment.id,
      nutrizProfileId: invasora.id,
    })
    expect(cancelled).toBe(false)

    const aindaMarcado = await getCurrentNutrizAppointment(dona.id)
    expect(aindaMarcado?.status).toBe('DECLARED')
  })

  it('não cancela duas vezes', async () => {
    const nutriz = await createTestNutrizProfile()
    const appointment = await createTestAppointment({
      nutrizProfileId: nutriz.id,
      scheduledAt: daysFromNow(3),
    })

    expect(
      await cancelNutrizAppointment({
        appointmentId: appointment.id,
        nutrizProfileId: nutriz.id,
      }),
    ).toBe(true)
    expect(
      await cancelNutrizAppointment({
        appointmentId: appointment.id,
        nutrizProfileId: nutriz.id,
      }),
    ).toBe(false)
  })
})
