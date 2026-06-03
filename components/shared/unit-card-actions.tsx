'use client'

import Link from 'next/link'
import { MessageCircle, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SEARCH } from '@/lib/i18n/pt-br'
import { buildPhoneHref } from '@/lib/utils/phone'
import { buildWhatsappUrl } from '@/lib/utils/whatsapp'

const COPY = SEARCH.page.unitCard

type UnitCardActionsProps = {
  unitId: string
  slug: string
  unitName: string
  phone: string | null
  whatsapp: string | null
  whatsappMessage?: string | null
}

/** Lê os UTMs da URL atual (somente leitura — nenhum dado pessoal da usuária). */
function getCurrentUtmParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  }
}

export function UnitCardActions({
  unitId,
  slug,
  unitName,
  phone,
  whatsapp,
  whatsappMessage,
}: UnitCardActionsProps) {
  const phoneHref = buildPhoneHref(phone)
  const message =
    whatsappMessage && whatsappMessage.trim()
      ? whatsappMessage
      : COPY.defaultWhatsappMessage
  const whatsappUrl = buildWhatsappUrl({ phone: whatsapp, message })

  /**
   * Dispara o tracking do clique sem bloquear a navegação para o WhatsApp.
   * Preparado para a Sprint 3.8 (rota `/api/track` ainda não existe); qualquer
   * falha — inclusive 404 — é ignorada silenciosamente.
   */
  function trackWhatsappClick() {
    const payload = {
      event: 'whatsapp_clicked',
      unit_id: unitId,
      unit_slug: slug,
      source: 'unit_card',
      path: window.location.pathname + window.location.search,
      source_utm: getCurrentUtmParams(),
      referrer: document.referrer || null,
    }
    const body = JSON.stringify(payload)

    try {
      const blob = new Blob([body], { type: 'application/json' })
      if (
        typeof navigator.sendBeacon === 'function' &&
        navigator.sendBeacon('/api/track', blob)
      ) {
        return
      }

      void fetch('/api/track', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {})
    } catch {
      // Tracking nunca bloqueia a navegação para o WhatsApp.
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {phoneHref ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          <a
            href={phoneHref}
            aria-label={COPY.ariaLabels.phone.replace('{unitName}', unitName)}
          >
            <Phone aria-hidden="true" />
            {COPY.phoneButton}
          </a>
        </Button>
      ) : null}

      {whatsappUrl ? (
        <Button
          asChild
          size="sm"
          className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 w-full sm:w-auto"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackWhatsappClick}
            aria-label={COPY.ariaLabels.whatsapp.replace(
              '{unitName}',
              unitName,
            )}
          >
            <MessageCircle aria-hidden="true" />
            {COPY.whatsappButton}
          </a>
        </Button>
      ) : null}

      {slug ? (
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
        >
          <Link
            href={`/banco-de-leite/${slug}`}
            aria-label={COPY.ariaLabels.details.replace('{unitName}', unitName)}
          >
            {COPY.detailsButton}
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
