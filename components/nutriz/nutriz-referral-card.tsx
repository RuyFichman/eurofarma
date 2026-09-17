'use client'

import { Copy, Link2, Send } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import {
  buildReferralMessage,
  buildWhatsappShareUrl,
} from '@/lib/referrals/message'

export function NutrizReferralCard({ code }: { code: string }) {
  const copy = NUTRIZ_AUTH.area.referral
  const path = `/cadastro?indicacao=${encodeURIComponent(code)}`
  const [link, setLink] = useState(path)
  const [message, setMessage] = useState(() =>
    buildReferralMessage(copy.messageTemplate, path),
  )
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const whatsappShareUrl = buildWhatsappShareUrl(message)

  useEffect(() => {
    const absoluteLink = new URL(path, window.location.origin).toString()
    setLink(absoluteLink)
    setMessage(buildReferralMessage(copy.messageTemplate, absoluteLink))
  }, [copy.messageTemplate, path])

  async function copyText(value: string, successMessage: string) {
    setFeedback(null)
    setError(null)
    try {
      await navigator.clipboard.writeText(value)
      setFeedback(successMessage)
    } catch {
      setError(copy.copyError)
    }
  }

  function copyLink() {
    return copyText(
      new URL(path, window.location.origin).toString(),
      copy.copiedFeedback,
    )
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
        <div className="mt-6">
          <p className="font-medium">{copy.messageTitle}</p>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {copy.messageDescription}
          </p>
          <label className="sr-only" htmlFor="nutriz-referral-message">
            {copy.messageLabel}
          </label>
          <Textarea
            id="nutriz-referral-message"
            className="mt-3 min-h-28 resize-y"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => copyText(message, copy.messageCopiedFeedback)}
            >
              <Copy aria-hidden="true" />
              {copy.copyMessageAction}
            </Button>
            <Button asChild>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send aria-hidden="true" />
                {copy.sendWhatsappAction}
              </a>
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-xs leading-5">
            {copy.sharingNotice}
          </p>
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
