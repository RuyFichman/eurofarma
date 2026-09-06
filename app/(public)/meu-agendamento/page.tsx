import type { Metadata } from 'next'
import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { AppointmentPreview } from '@/components/nutriz/appointment-preview'

export const metadata: Metadata = {
  title: NUTRIZ_AUTH.area.meta.title,
  description: NUTRIZ_AUTH.area.meta.description,
  robots: { index: false, follow: false },
}

/** Protótipo estático; autenticação real, sem leitura ou mutação de agendamentos. */
export default async function MeuAgendamentoPage() {
  const nutriz = await requireNutrizUser()
  return <AppointmentPreview fullName={nutriz.fullName} />
}
