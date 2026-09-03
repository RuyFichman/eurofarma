import { Prisma } from '@prisma/client'

import { prisma } from '../prisma'
import {
  UNIT_DETAIL_SELECT,
  mapUnitToPublicUnitDetail,
  type PublicUnitDetail,
} from '../../mappers/unit-detail-mapper'

/**
 * Colunas do agendamento visíveis para a própria nutriz. Traz a unidade pelo
 * mesmo `UNIT_DETAIL_SELECT` da página pública (Sprint 3.6) — é a mesma
 * informação de contato e endereço, e duplicar o select faria as duas telas
 * divergirem na primeira coluna nova.
 */
export const NUTRIZ_APPOINTMENT_SELECT = {
  id: true,
  reference: true,
  status: true,
  scheduledAt: true,
  failureReason: true,
  declaredAt: true,
  cancelledAt: true,
  // `status` vai além do `UNIT_DETAIL_SELECT` porque a tela precisa saber se
  // pode oferecer o link `/banco-de-leite/[slug]` — a rota da 3.6 chama
  // `notFound()` para unidade PENDING/INACTIVE, e o agendamento guarda a
  // unidade que existia quando a nutriz agendou, não necessariamente publicada.
  unit: { select: { ...UNIT_DETAIL_SELECT, status: true } },
} satisfies Prisma.AppointmentSelect

/**
 * Status e motivo em string literal (não o enum do `@prisma/client`) para o DTO
 * poder atravessar até Client Components sem arrastar o Prisma para o bundle —
 * mesma regra do `AdminUser` e do `NutrizUser`.
 */
export type NutrizAppointmentStatus =
  | 'DECLARED'
  | 'NOT_SCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'

export type NutrizAppointmentFailureReason =
  | 'NO_ANSWER'
  | 'NO_SLOT'
  | 'TOO_FAR'
  | 'GAVE_UP'
  | 'OTHER'

export type NutrizAppointment = {
  id: string
  reference: string
  status: NutrizAppointmentStatus
  scheduledAt: Date | null
  failureReason: NutrizAppointmentFailureReason | null
  declaredAt: Date
  cancelledAt: Date | null
  unit: PublicUnitDetail | null
  /** A unidade está publicada? Se não, `/banco-de-leite/[slug]` dá 404. */
  unitIsActive: boolean
  /** A data combinada ainda está por vir? Decide o tom da tela. */
  isUpcoming: boolean
}

type AppointmentRow = Prisma.AppointmentGetPayload<{
  select: typeof NUTRIZ_APPOINTMENT_SELECT
}>

function toNutrizAppointment(
  row: AppointmentRow,
  now: Date,
): NutrizAppointment {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    scheduledAt: row.scheduledAt,
    failureReason: row.failureReason,
    declaredAt: row.declaredAt,
    cancelledAt: row.cancelledAt,
    unit: row.unit ? mapUnitToPublicUnitDetail(row.unit) : null,
    unitIsActive: row.unit?.status === 'ACTIVE',
    isUpcoming: row.scheduledAt !== null && row.scheduledAt >= now,
  }
}

/**
 * O agendamento que a tela da nutriz deve mostrar.
 *
 * São **duas consultas em vez de um `orderBy` só** por causa dos nulos: um
 * registro de "não consegui agendar" tem `scheduledAt` nulo, e em Postgres
 * `order by scheduled_at desc` põe nulo primeiro — ele passaria na frente de
 * uma visita marcada de verdade. Então primeiro procuramos a próxima visita
 * ainda por vir; só se não houver nenhuma é que caímos no registro mais
 * recente, que pode ser uma visita passada, um cancelamento ou um "não
 * consegui". Ambas as consultas usam os índices criados na 6.1.
 */
export async function getCurrentNutrizAppointment(
  nutrizProfileId: string,
): Promise<NutrizAppointment | null> {
  const now = new Date()

  const upcoming = await prisma.appointment.findFirst({
    where: {
      nutrizProfileId,
      status: 'DECLARED',
      scheduledAt: { gte: now },
    },
    orderBy: { scheduledAt: 'asc' },
    select: NUTRIZ_APPOINTMENT_SELECT,
  })

  if (upcoming) return toNutrizAppointment(upcoming, now)

  const latest = await prisma.appointment.findFirst({
    where: { nutrizProfileId },
    orderBy: { declaredAt: 'desc' },
    select: NUTRIZ_APPOINTMENT_SELECT,
  })

  return latest ? toNutrizAppointment(latest, now) : null
}

/**
 * Marca como cancelado um agendamento **da própria nutriz**. O `nutrizProfileId`
 * entra no `where` (e não só o `id`) para que a ação não consiga tocar registro
 * de outra pessoa nem que receba um id alheio.
 *
 * Devolve `false` quando nada foi alterado — id inexistente, de outra nutriz ou
 * já cancelado.
 */
export async function cancelNutrizAppointment(params: {
  appointmentId: string
  nutrizProfileId: string
}): Promise<boolean> {
  const result = await prisma.appointment.updateMany({
    where: {
      id: params.appointmentId,
      nutrizProfileId: params.nutrizProfileId,
      status: 'DECLARED',
    },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  })

  return result.count > 0
}
