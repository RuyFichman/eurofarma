'use client'

import Image from 'next/image'
import { Download, Share2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import {
  POSTAL_DO_BEM_FILE_NAME,
  POSTAL_DO_BEM_IMAGE_PATH,
  POSTAL_DO_BEM_SHARE_TEXT,
} from '@/lib/sharing/postal-do-bem'

function downloadPostal() {
  const link = document.createElement('a')
  link.href = POSTAL_DO_BEM_IMAGE_PATH
  link.download = POSTAL_DO_BEM_FILE_NAME
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function PostalDoBemCard({ available }: { available: boolean }) {
  const copy = NUTRIZ_AUTH.area.personal.highlights.impactCard
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function sharePostal() {
    setFeedback(null)
    setError(null)

    try {
      const response = await fetch(POSTAL_DO_BEM_IMAGE_PATH)
      if (!response.ok) throw new Error('POSTAL_IMAGE_UNAVAILABLE')

      const image = new File([await response.blob()], POSTAL_DO_BEM_FILE_NAME, {
        type: 'image/png',
      })
      const shareData = {
        title: copy.shareTitle,
        text: POSTAL_DO_BEM_SHARE_TEXT,
        files: [image],
      }

      if (
        typeof navigator.share === 'function' &&
        (typeof navigator.canShare !== 'function' ||
          navigator.canShare({ files: [image] }))
      ) {
        await navigator.share(shareData)
        setFeedback(copy.sharedFeedback)
        return
      }

      downloadPostal()
      setFeedback(copy.downloadFallbackFeedback)
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === 'AbortError'
      ) {
        return
      }
      setError(copy.shareError)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col">
        <span className="bg-secondary text-primary flex size-10 items-center justify-center rounded-xl">
          <Share2 className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-semibold">{copy.title}</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {available ? copy.description : copy.unavailableDescription}
        </p>

        <div className="bg-muted mt-4 overflow-hidden rounded-2xl border">
          <Image
            src={POSTAL_DO_BEM_IMAGE_PATH}
            alt={copy.imageAlt}
            width={1080}
            height={1350}
            className="aspect-4/5 h-auto w-full object-cover"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={sharePostal} disabled={!available}>
            <Share2 aria-hidden="true" />
            {copy.shareAction}
          </Button>
          <Button
            asChild={available}
            type="button"
            variant="outline"
            disabled={!available}
          >
            {available ? (
              <a
                href={POSTAL_DO_BEM_IMAGE_PATH}
                download={POSTAL_DO_BEM_FILE_NAME}
              >
                <Download aria-hidden="true" />
                {copy.downloadAction}
              </a>
            ) : (
              <span>
                <Download aria-hidden="true" />
                {copy.downloadAction}
              </span>
            )}
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
      </CardContent>
    </Card>
  )
}
