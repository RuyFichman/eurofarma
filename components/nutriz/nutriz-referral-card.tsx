'use client'

import { Copy, Link2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

export function NutrizReferralCard({ code }: { code: string }) {
  const copy = NUTRIZ_AUTH.area.referral
  const path = `/cadastro?indicacao=${encodeURIComponent(code)}`
  const [link, setLink] = useState(path)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLink(new URL(path, window.location.origin).toString())
  }, [path])

  async function copyLink() {
    setFeedback(null)
    setError(null)
    try {
      await navigator.clipboard.writeText(
        new URL(path, window.location.origin).toString(),
      )
      setFeedback(copy.copiedFeedback)
    } catch {
      setError(copy.copyError)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="bg-secondary text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Link2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {copy.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <label className="sr-only" htmlFor="nutriz-referral-link">
          {copy.linkLabel}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="nutriz-referral-link"
            value={link}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button type="button" onClick={copyLink} className="shrink-0">
            <Copy aria-hidden="true" />
            {copy.copyAction}
          </Button>
        </div>
        {feedback ? (
          <p role="status" className="text-primary mt-3 text-sm">
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-destructive mt-3 text-sm">
            {error}
          </p>
        ) : null}
        <p className="text-muted-foreground mt-4 text-xs leading-5">
          {copy.safetyNotice}
        </p>
      </CardContent>
    </Card>
  )
}
