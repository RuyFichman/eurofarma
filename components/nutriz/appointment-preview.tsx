import Link from 'next/link'
import {
  Baby,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  Clock,
  Droplets,
  Heart,
  Info,
  LogOut,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Shield,
} from 'lucide-react'
import { APPOINTMENT_PREVIEW as COPY, A11Y } from '@/lib/i18n/pt-br'
import { logoutNutrizAction } from '@/app/(public)/meu-agendamento/actions'
import './appointment-preview.css'

const guidanceIcons = [Droplets, Shield, Clock, Baby] as const
const actionIcons = [MessageCircle, CalendarDays, MapPin] as const

export function AppointmentPreview({ fullName }: { fullName: string }) {
  const name = fullName.trim().split(/\s+/).slice(0, 2).join(' ')
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
  return (
    <div className="appointment-preview">
      <header className="preview-header">
        <div className="preview-container preview-header-inner">
          <Link href="/" className="preview-logo" aria-label={A11Y.logoHome}>
            <span className="preview-heart">
              <Heart fill="currentColor" />
            </span>
            <span>
              {COPY.brandStart}
              <span className="preview-blue">{COPY.brandEnd}</span>
            </span>
          </Link>
          <nav aria-label={A11Y.navMenu}>
            {COPY.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  item.href === '/meu-agendamento' ? 'page' : undefined
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="preview-account">
            <span className="preview-avatar">{initials}</span>
            {name}
          </div>
        </div>
      </header>
      <div className="preview-welcome">
        <div className="preview-container preview-welcome-inner">
          <span className="preview-avatar">{initials}</span>
          <div>
            <p>{COPY.area}</p>
            <h1>{COPY.greeting.replace('{name}', name)}</h1>
          </div>
          <form action={logoutNutrizAction}>
            <button type="submit">
              <LogOut />
              {COPY.logout}
            </button>
          </form>
        </div>
      </div>
      <div className="preview-container preview-columns">
        <div className="preview-primary">
          <section className="preview-status">
            <div className="preview-status-top">
              <span className="preview-status-icon">
                <CircleCheck />
              </span>
              <div>
                <p>{COPY.statusLabel}</p>
                <h2>
                  <span />
                  {COPY.status}
                </h2>
                <small>{COPY.reference}</small>
              </div>
              <div className="preview-network">
                <small>{COPY.networkLabel}</small>
                <span>{COPY.network}</span>
              </div>
            </div>
            <p className="preview-confirmation">
              <CheckCheck />
              {COPY.confirmation}
            </p>
          </section>
          <section className="preview-card">
            <h2>
              <CalendarDays />
              {COPY.detailsTitle}
            </h2>
            <div className="preview-details">
              {COPY.details.map((detail, index) => (
                <div key={detail.label}>
                  <p>{detail.label}</p>
                  <strong className={index === 1 ? 'preview-time' : undefined}>
                    {detail.value}
                  </strong>
                </div>
              ))}
            </div>
          </section>
          <section className="preview-card preview-guidance">
            <h2>
              <Info />
              {COPY.guidanceTitle}
            </h2>
            <div>
              {COPY.guidance.map((item, index) => {
                const Icon = guidanceIcons[index] ?? Info
                return (
                  <article key={item.title}>
                    <span
                      className={`preview-guidance-icon preview-tone-${index}`}
                    >
                      <Icon />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </div>
        <aside className="preview-secondary">
          <section className="preview-card preview-location">
            <h2>
              <MapPin />
              {COPY.locationTitle}
            </h2>
            <h3>{COPY.unit}</h3>
            <p>{COPY.address}</p>
            <p className="preview-postcode">{COPY.cep}</p>
            <div className="preview-phone">
              <Phone />
              {COPY.phone}
            </div>
            <div className="preview-map" aria-hidden="true">
              <span className="preview-map-road" />
              <span className="preview-map-pin">
                <Heart fill="currentColor" />
              </span>
            </div>
            <button type="button" disabled className="preview-directions">
              <Navigation />
              {COPY.directions}
            </button>
          </section>
          <section className="preview-card preview-quick">
            <h2>{COPY.quickTitle}</h2>
            {COPY.actions.map((label, index) => {
              const Icon = actionIcons[index] ?? MapPin
              return (
                <button
                  type="button"
                  disabled
                  key={label}
                  className={`preview-action preview-action-${index}`}
                >
                  <span>
                    <Icon />
                  </span>
                  {label}
                  <ChevronRight />
                </button>
              )
            })}
          </section>
          <section className="preview-cancel">
            <h2>{COPY.cancelTitle}</h2>
            <p>{COPY.cancelBody}</p>
            <button type="button" disabled>
              {COPY.cancelAction}
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}
