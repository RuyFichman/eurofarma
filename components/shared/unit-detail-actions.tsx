'use client'

import Link from 'next/link'
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { UNIT_DETAIL } from '@/lib/i18n/pt-br'
import { buildPhoneHref } from '@/lib/utils/phone'
import { buildWhatsappUrl } from '@/lib/utils/whatsapp'

const COPY = UNIT_DETAIL.actions
const ARIA = UNIT_DETAIL.ariaLabels

type UnitDetailActionsProps = {
  unitId: string
  unitSlug: string
  unitName: string
  phone: string | null
  whatsapp: string | null
  whatsappMessage: string | null
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

export function UnitDetailActions({
  unitId,
  unitSlug,
  unitName,
  phone,
  whatsapp,
  whatsappMessage,
}: UnitDetailActionsProps) {
  const phoneHref = buildPhoneHref(phone)
  const message =
    whatsappMessage && whatsappMessage.trim()
      ? whatsappMessage
      : UNIT_DETAIL.whatsapp.defaultMessage
  const whatsappUrl = buildWhatsappUrl({ phone: whatsapp, message })

  /**
   * Dispara o tracking do clique sem bloquear a navegação para o WhatsApp.
   * Preparado para a Sprint 3.8 (rota `/api/track` ainda não existe); qualquer
   * falha — inclusive 404 — é ignorada silenciosamente. Payload sem PII da nutriz.
   */
  function trackWhatsappClick() {
    const payload = {
      event: 'whatsapp_clicked',
      unit_id: unitId,
      unit_slug: unitSlug,
      source: 'unit_detail',
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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {whatsappUrl ? (
        <Button
          asChild
          size="lg"
          className="bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 w-full sm:w-auto"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackWhatsappClick}
            aria-label={ARIA.whatsapp.replace('{unitName}', unitName)}
          >
            <MessageCircle aria-hidden="true" />
            {COPY.whatsapp}
          </a>
        </Button>
      ) : null}

      {phoneHref ? (
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full sm:w-auto"
        >
          <a
            href={phoneHref}
            aria-label={ARIA.phone.replace('{unitName}', unitName)}
          >
            <Phone aria-hidden="true" />
            {COPY.phone}
          </a>
        </Button>
      ) : null}

      <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
        <Link href="/buscar" aria-label={ARIA.backToSearch}>
          <ArrowLeft aria-hidden="true" />
          {COPY.backToSearch}
        </Link>
      </Button>
    </div>
  )
}
