import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import {
  getEducationalSuggestionIds,
  type EducationalSuggestionId,
} from '@/lib/journey/educational-suggestions'
import type { JourneyStatusValue } from '@/lib/journey/status'

export function EducationalSuggestions({
  status,
}: {
  status: JourneyStatusValue
}) {
  const copy = NUTRIZ_AUTH.area.personal.education
  const suggestions = getEducationalSuggestionIds(status).map((id) => ({
    id,
    ...copy.suggestions[id],
  }))

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
        <div className="grid gap-4 md:grid-cols-2">
          {suggestions.map((suggestion) => (
            <article
              key={suggestion.id}
              className="bg-muted/30 flex flex-col rounded-xl border p-4"
            >
              <p className="text-primary text-xs font-semibold">
                {copy.readMore}
              </p>
              <h3 className="mt-2 font-medium">{suggestion.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {suggestion.description}
              </p>
              <ButtonLink href={suggestion.href} label={copy.openAction} />
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ButtonLink({
  href,
  label,
}: {
  href: (typeof NUTRIZ_AUTH.area.personal.education.suggestions)[EducationalSuggestionId]['href']
  label: string
}) {
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
