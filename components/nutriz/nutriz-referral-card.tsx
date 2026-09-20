'use client'

import { Copy, Link2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { WhatsappIcon } from '@/components/shared/whatsapp-icon'
import { SITE_ORIGIN } from '@/lib/constants/site'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import {
  buildReferralMessage,
  buildWhatsappShareUrl,
} from '@/lib/referrals/message'

export function NutrizReferralCard({ code }: { code: string }) {
  const copy = NUTRIZ_AUTH.area.referral
  const path = `/cadastro?indicacao=${encodeURIComponent(code)}`
  // `SITE_ORIGIN` é fixo (não depende de `window`), então o link e a
  // mensagem já saem corretos no primeiro render — sem o piscar de um
  // useEffect trocando o caminho relativo pela URL absoluta depois do mount.
  const link = new URL(path, SITE_ORIGIN).toString()
  const [message, setMessage] = useState(() =>
    buildReferralMessage(copy.messageTemplate, link),
  )
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const whatsappShareUrl = buildWhatsappShareUrl(message)

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
    return copyText(link, copy.copiedFeedback)
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
          <Button
            type="button"
            variant="outline"
            onClick={copyLink}
            className="shrink-0"
          >
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
            {/* Reafirma cor de texto e borda no hover: a variante "default" do
                Button inverte para fundo branco/texto azul ao passar o mouse,
                e esse botão precisa continuar verde (exceção documentada). */}
            <Button
              asChild
              className="bg-whatsapp-brand text-whatsapp-brand-foreground hover:bg-whatsapp-brand/90 hover:text-whatsapp-brand-foreground border-transparent hover:border-transparent"
            >
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsappIcon className="size-4" />
                {copy.sendWhatsappAction}
              </a>
            </Button>
          </div>
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
      </CardContent>
    </Card>
  )
}
