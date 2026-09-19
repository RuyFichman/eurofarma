'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ADMIN } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

type AdminCampaignLinkProps = {
  href: string
  name: string
  compact?: boolean
}

export function AdminCampaignLink({
  href,
  name,
  compact = false,
}: AdminCampaignLinkProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )
  const copy = ADMIN.campaigns.link

  async function copyLink() {
    try {
      const absoluteUrl = new URL(href, window.location.origin).toString()
      await navigator.clipboard.writeText(absoluteUrl)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('error')
      window.setTimeout(() => setCopyState('idle'), 2400)
    }
  }

  return (
    <div
      className={cn(
        'border-border/70 bg-muted/35 flex min-w-0 items-center gap-2 rounded-xl border p-2',
        compact ? 'max-w-xl' : 'w-full',
      )}
    >
      <code className="text-foreground min-w-0 flex-1 truncate px-1 text-xs">
        {href}
      </code>
      <Button
        type="button"
        variant="ghost"
        size={compact ? 'icon-sm' : 'sm'}
        onClick={copyLink}
        aria-label={copy.copyAria.replace('{name}', name)}
        title={
          copyState === 'copied'
            ? copy.copied
            : copyState === 'error'
              ? copy.copyError
              : copy.copy
        }
      >
        {copyState === 'copied' ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        {!compact ? (
          <span>
            {copyState === 'copied'
              ? copy.copied
              : copyState === 'error'
                ? copy.copyError
                : copy.copy}
          </span>
        ) : null}
      </Button>
      <Button asChild variant="ghost" size={compact ? 'icon-sm' : 'sm'}>
        <Link
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={copy.openAria.replace('{name}', name)}
          title={copy.open}
        >
          <ExternalLink aria-hidden="true" />
          {!compact ? <span>{copy.open}</span> : null}
        </Link>
      </Button>
    </div>
  )
}
