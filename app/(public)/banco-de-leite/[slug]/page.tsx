import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Clock, FileText, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnitDetailActions } from '@/components/shared/unit-detail-actions'
import { UnitDetailInfoCard } from '@/components/shared/unit-detail-info-card'
import { UnitDetailMap } from '@/components/shared/unit-detail-map'
import { getActiveUnitBySlug } from '@/lib/db/queries/get-unit-by-slug'
import { buildUnitLocalBusinessJsonLd } from '@/lib/seo/unit-json-ld'
import { UNIT_DETAIL } from '@/lib/i18n/pt-br'

// Revalidação por tempo (ISR). Revalidação on-demand pelo admin fica para depois.
export const revalidate = 3600

// Memoiza a busca por request: `generateMetadata` e a página compartilham a
// mesma query (uma única ida ao banco por requisição).
const loadUnit = cache(getActiveUnitBySlug)

type UnitDetailPageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Extrai um horário legível de `openingHours` (JSON livre). Nos dados atuais vem
 * como string ("Seg a Sex 8h às 17h"); aceita também objetos com um campo
 * textual simples. Nunca renderiza JSON cru — retorna `null` para cair no fallback.
 */
function readableOpeningHours(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of ['text', 'label', 'description', 'summary'] as const) {
      const field = (value as Record<string, unknown>)[key]
      if (typeof field === 'string' && field.trim().length > 0) {
        return field.trim()
      }
    }
  }
  return null
}

export async function generateMetadata({
  params,
}: UnitDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const unit = await loadUnit(slug)

  if (!unit) {
    return {
      title: `${UNIT_DETAIL.seo.notFoundTitle} | ${UNIT_DETAIL.seo.titleSuffix}`,
      description: UNIT_DETAIL.seo.notFoundDescription,
    }
  }

  return {
    title: `${unit.name} | ${UNIT_DETAIL.seo.titleSuffix}`,
    description: UNIT_DETAIL.seo.descriptionTemplate.replace(
      '{unitName}',
      unit.name,
    ),
  }
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { slug } = await params
  const unit = await loadUnit(slug)

  if (!unit) {
    notFound()
  }

  const hours = readableOpeningHours(unit.openingHours)
  const typeLabel = UNIT_DETAIL.typeLabels[unit.type]
  const jsonLd = buildUnitLocalBusinessJsonLd(unit)

  const reportSubject = UNIT_DETAIL.report.subjectTemplate.replace(
    '{unitName}',
    unit.name,
  )
  // TODO: substituir e-mail de reporte pelo canal oficial aprovado pela Eurofarma.
  const reportHref = `mailto:${UNIT_DETAIL.report.email}?subject=${encodeURIComponent(reportSubject)}`

  return (
    <section className="py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
        <nav aria-label="Breadcrumb">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
            <li>
              <Link href="/" className="hover:text-foreground">
                {UNIT_DETAIL.breadcrumb.home}
              </Link>
            </li>
            <li aria-hidden="true" className="flex items-center">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link href="/buscar" className="hover:text-foreground">
                {UNIT_DETAIL.breadcrumb.search}
              </Link>
            </li>
            <li aria-hidden="true" className="flex items-center">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <span className="text-foreground font-medium" aria-current="page">
                {unit.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="bg-card rounded-3xl border p-6 shadow-sm md:p-8">
          <Badge variant="secondary" className="mb-3">
            {typeLabel}
          </Badge>
          <h1 className="text-2xl font-semibold md:text-3xl">{unit.name}</h1>
          <p className="text-muted-foreground mt-2">{unit.address.summary}</p>

          {unit.contact.hasWhatsapp || unit.contact.hasPhone || hours ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {unit.contact.hasWhatsapp ? (
                <Badge variant="outline">
                  {UNIT_DETAIL.badges.whatsappAvailable}
                </Badge>
              ) : null}
              {unit.contact.hasPhone ? (
                <Badge variant="outline">
                  {UNIT_DETAIL.badges.phoneAvailable}
                </Badge>
              ) : null}
              {hours ? (
                <Badge variant="outline">
                  {UNIT_DETAIL.badges.openingHoursAvailable}
                </Badge>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6">
            <UnitDetailActions
              unitId={unit.id}
              unitSlug={unit.slug}
              unitName={unit.name}
              phone={unit.contact.phone}
              whatsapp={unit.contact.whatsapp}
              whatsappMessage={unit.whatsappMessage}
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="text-primary size-5" aria-hidden="true" />
                  {UNIT_DETAIL.openingHours.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">
                  {hours ?? UNIT_DETAIL.openingHours.fallback}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText
                    className="text-primary size-5"
                    aria-hidden="true"
                  />
                  {UNIT_DETAIL.instructions.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">
                  {unit.instructions && unit.instructions.trim()
                    ? unit.instructions
                    : UNIT_DETAIL.instructions.fallback}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-secondary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck
                    className="text-primary size-5"
                    aria-hidden="true"
                  />
                  {UNIT_DETAIL.safety.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{UNIT_DETAIL.safety.text}</p>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <UnitDetailInfoCard unit={unit} />
            <UnitDetailMap unit={unit} />
          </aside>
        </div>

        <div className="border-t pt-6">
          <Button
            asChild
            variant="link"
            className="text-muted-foreground h-auto p-0"
          >
            <a
              href={reportHref}
              aria-label={UNIT_DETAIL.ariaLabels.reportProblem.replace(
                '{unitName}',
                unit.name,
              )}
            >
              {UNIT_DETAIL.actions.reportProblem}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
