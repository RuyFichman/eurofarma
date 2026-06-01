import Link from 'next/link'

import { cn } from '@/lib/utils/cn'
import { A11Y, SITE } from '@/lib/i18n/pt-br'

type LogoProps = {
  variant?: 'default' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

const TEXT_SIZE: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
}

const ICON_SIZE: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 20,
  md: 22,
  lg: 28,
}

export function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const colorClass = variant === 'light' ? 'text-white' : 'text-primary'

  return (
    <Link
      href="/"
      aria-label={A11Y.logoHome}
      className={cn(
        'inline-flex items-center gap-2 font-semibold tracking-tight',
        'focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:outline-none',
        colorClass,
        TEXT_SIZE[size],
      )}
    >
      {/* Gota estilizada (placeholder até o logo oficial da Eurofarma). */}
      <svg
        width={ICON_SIZE[size]}
        height={ICON_SIZE[size]}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 2.5c3.4 4 6.5 7.4 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.9 8.6 6.5 12 2.5Z" />
      </svg>
      <span>{SITE.name}</span>
    </Link>
  )
}
