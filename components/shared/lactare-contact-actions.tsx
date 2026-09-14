'use client'

import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LACTARE_CONTACT } from '@/lib/constants/lactare-contact'
import { COVERAGE } from '@/lib/i18n/pt-br'
import { readUtmParams } from '@/lib/utils/utm'
import {
  CONTACT_CLICK_EVENT,
  type ContactClickChannel,
  type ContactClickSurface,
} from '@/lib/validators/contact-click'

const COPY = COVERAGE.eligible.contact
const ENDPOINT = '/api/contact-click'

type LactareContactActionsProps = {
  surface: ContactClickSurface
}

/**
 * Botões dos canais oficiais do Lactare, isolados como Client Component só
 * porque o clique precisa de handler — o cartão em volta continua servidor.
 *
 * O tracking (RF07) não altera o destino nem atrasa a saída da página: o envio
 * é `sendBeacon`, e qualquer falha é ignorada. Nenhuma informação da visitante
 * entra no payload: só o canal, a tela e as UTMs da URL atual.
 */
export function LactareContactActions({ surface }: LactareContactActionsProps) {
  function trackContactClick(channel: ContactClickChannel) {
    const body = JSON.stringify({
      event: CONTACT_CLICK_EVENT,
      channel,
      surface,
      source_utm: readUtmParams(window.location.search),
    })

    try {
      const blob = new Blob([body], { type: 'application/json' })
      if (
        typeof navigator.sendBeacon === 'function' &&
        navigator.sendBeacon(ENDPOINT, blob)
      ) {
        return
      }

      void fetch(ENDPOINT, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {})
    } catch {
      // Métrica nunca bloqueia o contato com o Lactare.
    }
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <Button asChild>
        <a
          href={LACTARE_CONTACT.whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackContactClick('whatsapp')}
        >
          <MessageCircle aria-hidden="true" />
          {COPY.whatsapp}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </Button>
      <Button asChild variant="outline">
        <a
          href={LACTARE_CONTACT.phoneHref}
          onClick={() => trackContactClick('phone')}
        >
          <Phone aria-hidden="true" />
          {COPY.phone}
        </a>
      </Button>
    </div>
  )
}
