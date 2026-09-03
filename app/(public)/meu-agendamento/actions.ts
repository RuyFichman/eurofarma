'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/lib/auth/supabase-server'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { cancelNutrizAppointment } from '@/lib/db/queries/appointments'

/**
 * Encerra a sessão da nutriz. O `signOut` limpa o cookie via SSR; o redirect
 * acontece mesmo se ele falhar, para nunca prender a pessoa numa tela sem saída.
 */
export async function logoutNutrizAction(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  } catch {
    // Falha ao contatar o Supabase não deve bloquear a saída da UI.
  }

  redirect('/')
}

const appointmentIdSchema = z.string().uuid()

/**
 * Marca o agendamento como cancelado.
 *
 * Server Action é endpoint próprio: o gate do layout protege a *tela*, não a
 * *mutação*. Por isso `requireNutrizUser()` é chamado **antes de qualquer
 * trabalho** e **fora do `try`** — o `redirect` interno do helper sinaliza por
 * exceção e seria engolido pelo `catch` (mesma regra da 5.8).
 *
 * A dona do agendamento não vem do cliente: o `id` recebido é cruzado com o
 * perfil da sessão dentro da consulta, então um id alheio simplesmente não
 * altera nada. O retorno é um booleano sem detalhe — a UI não precisa saber se
 * o id não existia, era de outra pessoa ou já estava cancelado, e distinguir
 * isso na resposta contaria a quem chamou algo sobre registros alheios.
 */
export async function cancelAppointmentAction(
  appointmentId: string,
): Promise<{ ok: boolean }> {
  const nutriz = await requireNutrizUser()

  try {
    const parsed = appointmentIdSchema.safeParse(appointmentId)
    if (!parsed.success) return { ok: false }

    const cancelled = await cancelNutrizAppointment({
      appointmentId: parsed.data,
      nutrizProfileId: nutriz.id,
    })
    if (!cancelled) return { ok: false }

    revalidatePath('/meu-agendamento')
    return { ok: true }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // Só o erro técnico — nunca dado da nutriz.
      console.error('[cancelAppointmentAction]', error)
    }
    return { ok: false }
  }
}
