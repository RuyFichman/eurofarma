import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { NutrizPersonalAreaData } from '@/lib/db/queries/nutriz-personal-area'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

function excerpt(markdown: string): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_>`~-]/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 180 ? `${plain.slice(0, 177)}...` : plain
}

export function EducationalSuggestions({
  contents,
}: {
  contents: NutrizPersonalAreaData['educationalContents']
}) {
  const copy = NUTRIZ_AUTH.area.personal.education

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary size-5" aria-hidden="true" />
          <CardTitle>{copy.title}</CardTitle>
        </div>
        <CardDescription className="leading-6">
          {copy.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contents.length === 0 ? (
          <div className="bg-muted/50 rounded-xl border p-4">
            <p className="text-sm leading-6">{copy.empty}</p>
            <h3 className="mt-4 font-medium">{copy.fallbackTitle}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {copy.fallbackDescription}
            </p>
            <ButtonLink href="/como-funciona" label={copy.fallbackAction} />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {contents.map((content) => (
              <article
                key={content.id}
                className="bg-muted/30 flex flex-col rounded-xl border p-4"
              >
                <p className="text-primary text-xs font-semibold">
                  {copy.readMore}
                </p>
                <h3 className="mt-2 font-medium">{content.title}</h3>
                <p className="text-muted-foreground mt-2 line-clamp-4 text-sm leading-6">
                  {excerpt(content.bodyMarkdown)}
                </p>
                <ButtonLink
                  href={`/como-funciona#${content.slug}`}
                  label={copy.fallbackAction}
                />
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
    >
      {label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  )
}
