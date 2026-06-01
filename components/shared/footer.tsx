import Link from 'next/link'

import { Logo } from '@/components/shared/logo'
import { FOOTER, NAV, SITE } from '@/lib/i18n/pt-br'

const legalLinks = [FOOTER.links.privacy, FOOTER.links.terms]

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
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

          {/* Contato */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase opacity-70">
              {FOOTER.contact.title}
            </h3>
            <a
              href={`mailto:${FOOTER.contact.placeholder}`}
              className="text-sm opacity-80 transition-opacity hover:underline hover:opacity-100"
            >
              {FOOTER.contact.placeholder}
            </a>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs opacity-70 md:flex-row md:items-center md:justify-between">
          <p>{FOOTER.copyright}</p>
          <div className="flex flex-col gap-0.5 md:items-end">
            <span>{SITE.credits}</span>
            <span>{SITE.partnerCredit}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
