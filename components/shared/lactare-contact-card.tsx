import { ArrowUpRight, Clock3, MessageCircle, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LACTARE_CONTACT } from '@/lib/constants/lactare-contact'
import { COVERAGE } from '@/lib/i18n/pt-br'

export function LactareContactCard() {
  const copy = COVERAGE.eligible.contact

  return (
    <div className="bg-background mt-6 rounded-2xl border p-5 shadow-sm">
      <p className="text-primary text-sm font-semibold">{copy.eyebrow}</p>
      <h3 className="mt-1 text-lg font-semibold">{copy.title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {copy.description}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <a
            href={LACTARE_CONTACT.whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle aria-hidden="true" />
            {copy.whatsapp}
            <ArrowUpRight aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={LACTARE_CONTACT.phoneHref}>
            <Phone aria-hidden="true" />
            {copy.phone}
          </a>
        </Button>
      </div>

      <dl className="bg-muted/50 mt-5 grid gap-4 rounded-xl border p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs">
            {copy.whatsappLabel}
          </dt>
          <dd className="mt-1 font-medium">
            {LACTARE_CONTACT.whatsappDisplay}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">{copy.phoneLabel}</dt>
          <dd className="mt-1 font-medium">{LACTARE_CONTACT.phoneDisplay}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-start gap-2">
        <Clock3
          className="text-primary mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <p className="text-muted-foreground text-xs leading-5">{copy.hours}</p>
      </div>

      <p className="text-muted-foreground mt-4 text-xs leading-5">
        {copy.operationalNotice}
      </p>
      <a
        href={LACTARE_CONTACT.officialSourceHref}
        target="_blank"
        rel="noreferrer"
        className="text-primary focus-visible:ring-ring mt-4 inline-flex max-w-full items-start gap-1 rounded-sm text-xs font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
      >
        <span>
          {copy.source
            .replace('{date}', LACTARE_CONTACT.verifiedAtDisplay)
            .replace('{source}', copy.sourceName)}
        </span>
        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      </a>
    </div>
  )
}
