import Link from 'next/link'
import { Heart, Quote, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ContentSectionHeader } from '@/components/shared/content-section-header'
import { CONTENT } from '@/lib/i18n/pt-br'

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

export function ContentStories() {
  const { stories } = CONTENT

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <ContentSectionHeader
          icon={Heart}
          eyebrow={stories.eyebrow}
          title={stories.title}
          description={stories.description}
        />

        {/* Depoimentos ilustrativos — substituir por relatos reais e consentidos (LGPD). */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {stories.items.map((story) => (
            <Card key={story.name} className="relative h-full">
              <Quote
                className="text-secondary absolute top-6 right-6 size-10"
                aria-hidden="true"
              />
              <CardHeader className="gap-3">
                <Badge variant="secondary" className="w-fit">
                  {story.role}
                </Badge>
                <div className="flex gap-0.5" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Star
                      key={index}
                      className="fill-chart-4 text-chart-4 size-4"
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="grow">
                <blockquote className="text-sm leading-6">
                  “{story.quote}”
                </blockquote>
              </CardContent>
              <CardFooter className="gap-3 border-t pt-6">
                <span className="bg-secondary text-secondary-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                  {initials(story.name)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{story.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {story.detail}
                  </p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-muted-foreground">{stories.cta.lead}</p>
          <Button asChild size="lg" className="mt-4">
            <Link href={stories.cta.href}>
              <Heart aria-hidden="true" />
              {stories.cta.label}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
