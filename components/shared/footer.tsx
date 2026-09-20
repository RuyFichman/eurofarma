import Link from 'next/link'
import { Globe2, Mail } from 'lucide-react'

import { Logo } from '@/components/shared/logo'
import {
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from '@/components/shared/social-brand-icons'
import { WhatsappIcon } from '@/components/shared/whatsapp-icon'
import { FOOTER, NAV, SITE } from '@/lib/i18n/pt-br'

const legalLinks = [FOOTER.links.privacy, FOOTER.links.terms]
const lactareChannels = [
  { ...FOOTER.contact.channels.website, icon: Globe2 },
  { ...FOOTER.contact.channels.instagram, icon: InstagramIcon },
  { ...FOOTER.contact.channels.youtube, icon: YoutubeIcon },
  { ...FOOTER.contact.channels.linkedin, icon: LinkedinIcon },
  { ...FOOTER.contact.channels.whatsapp, icon: WhatsappIcon },
] as const

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
          {/* Marca */}
          <div className="space-y-3">
            <Logo variant="light" size="lg" />
            <p className="max-w-xs text-sm leading-6 opacity-80">
              {SITE.tagline}
            </p>
          </div>

          {/* Navegação */}
          <nav aria-label={FOOTER.sections.navigation} className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase opacity-70">
              {FOOTER.sections.navigation}
            </h3>
            <ul className="space-y-2 text-sm">
              {NAV.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="opacity-80 transition-opacity hover:underline hover:opacity-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label={FOOTER.sections.legal} className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase opacity-70">
              {FOOTER.sections.legal}
            </h3>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="opacity-80 transition-opacity hover:underline hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Canais oficiais do Lactare */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase opacity-70">
              {FOOTER.contact.title}
            </h3>
            <p className="max-w-xs text-sm leading-6 opacity-80">
              {FOOTER.contact.description}
            </p>
            <a
              href={`mailto:${FOOTER.contact.email.address}`}
              className="focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-sm text-sm opacity-80 transition-opacity outline-none hover:underline hover:opacity-100 focus-visible:ring-[3px]"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              {FOOTER.contact.email.address}
            </a>

            <ul className="flex flex-wrap gap-2 pt-1">
              {lactareChannels.map((channel) => {
                const Icon = channel.icon

                return (
                  <li key={channel.href}>
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={channel.label}
                      title={channel.label}
                      className="focus-visible:ring-ring/50 flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 opacity-85 transition-all outline-none hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:opacity-100 focus-visible:ring-[3px]"
                    >
                      <Icon className="size-4.5" aria-hidden="true" />
                      <span className="sr-only">{channel.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs opacity-70 md:flex-row md:items-center md:justify-between">
          <p>
            {FOOTER.copyright} <span aria-hidden="true">·</span>{' '}
            <Link
              href={FOOTER.links.admin.href}
              className="opacity-80 transition-opacity hover:underline hover:opacity-100"
            >
              {FOOTER.links.admin.label}
            </Link>
          </p>
          <div className="flex flex-col gap-0.5 md:items-end">
            <span>{SITE.credits}</span>
            <span>{SITE.partnerCredit}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
