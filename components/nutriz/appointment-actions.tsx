'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, MessageCircle, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { APPOINTMENT } from '@/lib/i18n/pt-br'
import { cancelAppointmentAction } from '@/app/(public)/meu-agendamento/actions'

const COPY = APPOINTMENT

/**
 * Ações da tela de agendamento. É o **único trecho Client** da página: o resto
 * é Server Component, e aqui só existe estado porque o cancelamento é em dois
 * passos.
 *
 * Os dois passos substituem um `window.confirm`, que bloqueia a aba e não é
 * estilizável. Não há diálogo modal porque a ação é reversível na prática —
 * basta ela contar um novo agendamento pelo WhatsApp.
 *
 * O `whatsappUrl` chega pronto do servidor: montar `wa.me` exige o telefone e a
 * mensagem da unidade, e trazer isso para o cliente só para concatenar string
 * engordaria o bundle sem ganho.
 */
export function AppointmentActions({
  appointmentId,
  canCancel,
  whatsappUrl,
  unitSlug,
}: {
  appointmentId: string
  canCancel: boolean
  whatsappUrl: string | null
  unitSlug: string | null
}) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onConfirmCancel() {
    setError(null)
    startTransition(async () => {
      const result = await cancelAppointmentAction(appointmentId)
      if (result.ok) {
        setIsConfirming(false)
        router.refresh()
        return
      }
      setError(COPY.cancel.error)
    })
  }

  return (
    <div className="space-y-4">
      <section className="bg-card rounded-3xl border p-5 shadow-sm">
        <h2 className="text-base font-semibold">{COPY.actions.title}</h2>

        <div className="mt-4 space-y-2">
          {whatsappUrl ? (
            <Button
              asChild
              variant="outline"
              className="border-whatsapp/30 text-whatsapp hover:bg-whatsapp/5 hover:text-whatsapp h-11 w-full justify-start rounded-xl"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                {COPY.actions.whatsapp}
              </a>
            </Button>
          ) : null}

          {unitSlug ? (
            <Button
              asChild
              variant="outline"
              className="h-11 w-full justify-start rounded-xl"
            >
              <Link href={`/banco-de-leite/${unitSlug}`}>
                <Building2 aria-hidden="true" />
                {COPY.actions.unitPage}
              </Link>
            </Button>
          ) : null}

          <Button
            asChild
            variant="outline"
            className="h-11 w-full justify-start rounded-xl"
          >
            <Link href="/buscar">
              <Search aria-hidden="true" />
              {COPY.actions.searchOther}
            </Link>
          </Button>
        </div>
      </section>

      {canCancel ? (
        <section className="bg-muted/40 rounded-3xl border p-5">
          <h2 className="text-sm font-medium">{COPY.cancel.title}</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {COPY.cancel.body}
          </p>

          {error ? (
            <p role="alert" className="text-destructive mt-3 text-sm">
              {error}
            </p>
          ) : null}

          {isConfirming ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onConfirmCancel}
                disabled={isPending}
              >
                {isPending ? COPY.cancel.submitting : COPY.cancel.confirm}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirming(false)}
                disabled={isPending}
              >
                {COPY.cancel.dismiss}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirming(true)}
              className="text-muted-foreground hover:text-foreground mt-3 text-sm underline underline-offset-4"
            >
              {COPY.cancel.action}
            </button>
          )}
        </section>
      ) : null}
    </div>
  )
}
