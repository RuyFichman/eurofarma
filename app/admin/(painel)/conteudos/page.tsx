import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  Plus,
  SearchX,
} from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ADMIN_CONTENTS_PATH,
  buildAdminContentsHref,
  hasActiveAdminContentFilters,
  parseAdminContentFilters,
  type AdminContentsSearchParams,
} from '@/lib/admin/contents/filters'
import { getAdminContents } from '@/lib/db/queries/educational-contents'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.contents

export const metadata: Metadata = {
  title: COPY.seo.title,
  description: COPY.seo.description,
}

export default async function AdminContentsPage({
  searchParams,
}: {
  searchParams: Promise<AdminContentsSearchParams>
}) {
  const filters = parseAdminContentFilters(await searchParams)
  const { contents, categories, pagination } = await getAdminContents(filters)
  const hasFilters = hasActiveAdminContentFilters(filters)
  const countLabel =
    pagination.total === 1 ? COPY.results.countOne : COPY.results.countOther

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {COPY.title}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
            {COPY.description}
          </p>
        </div>
        <Button asChild>
          <Link href={`${ADMIN_CONTENTS_PATH}/novo`}>
            <Plus aria-hidden="true" />
            {COPY.createAction}
          </Link>
        </Button>
      </div>

      <Alert>
        <Info aria-hidden="true" />
        <AlertDescription>{COPY.integrationNotice}</AlertDescription>
      </Alert>

      <form
        method="get"
        aria-label={COPY.filters.label}
        className="bg-card grid gap-4 rounded-2xl border p-5 shadow-sm md:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.45fr)_minmax(11rem,0.55fr)_auto] md:items-end"
      >
        <div className="space-y-2">
          <Label htmlFor="contents-q">{COPY.filters.search.label}</Label>
          <Input
            id="contents-q"
            name="q"
            defaultValue={filters.query}
            placeholder={COPY.filters.search.placeholder}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contents-status">{COPY.filters.status.label}</Label>
          <select
            id="contents-status"
            name="status"
            defaultValue={filters.status}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">{COPY.filters.status.all}</option>
            <option value="PUBLISHED">{COPY.filters.status.published}</option>
            <option value="DRAFT">{COPY.filters.status.draft}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contents-category">
            {COPY.filters.category.label}
          </Label>
          <select
            id="contents-category"
            name="category"
            defaultValue={filters.category}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">{COPY.filters.category.all}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {hasFilters ? (
            <Button asChild type="button" variant="outline">
              <Link href={ADMIN_CONTENTS_PATH}>
                {COPY.filters.actions.clear}
              </Link>
            </Button>
          ) : null}
          <Button type="submit">{COPY.filters.actions.apply}</Button>
        </div>
      </form>

      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="bg-primary size-2 rounded-full" aria-hidden="true" />
        <span className="text-primary tabular-nums">
          {formatCount(pagination.total)}
        </span>{' '}
        {countLabel}
      </div>

      {contents.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-2xl border md:block">
            <table className="bg-card w-full text-sm">
              <caption className="sr-only">{COPY.table.caption}</caption>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.content}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.category}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.status}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.updatedAt}
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    {COPY.table.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content) => (
                  <tr key={content.id} className="border-t">
                    <th scope="row" className="px-5 py-4 text-left font-medium">
                      <span className="flex items-center gap-2">
                        <FileText
                          className="text-primary size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {content.title}
                      </span>
                      <span className="text-muted-foreground mt-1 block text-xs font-normal">
                        {COPY.table.slugLabel.replace('{slug}', content.slug)}
                      </span>
                    </th>
                    <td className="px-5 py-4">
                      {content.category ?? COPY.table.withoutCategory}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={content.isPublished ? 'default' : 'secondary'}
                      >
                        {content.isPublished
                          ? COPY.table.published
                          : COPY.table.draft}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-5 py-4 tabular-nums">
                      {formatShortDate(content.updatedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`${ADMIN_CONTENTS_PATH}/${content.id}/editar`}
                          aria-label={COPY.table.editAria.replace(
                            '{title}',
                            content.title,
                          )}
                        >
                          {COPY.table.edit}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-4 md:hidden">
            {contents.map((content) => (
              <li
                key={content.id}
                className="bg-card rounded-2xl border p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-pretty">
                      {content.title}
                    </h2>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {COPY.table.slugLabel.replace('{slug}', content.slug)}
                    </p>
                  </div>
                  <Badge
                    variant={content.isPublished ? 'default' : 'secondary'}
                  >
                    {content.isPublished
                      ? COPY.table.published
                      : COPY.table.draft}
                  </Badge>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      {COPY.table.columns.category}
                    </dt>
                    <dd className="mt-1">
                      {content.category ?? COPY.table.withoutCategory}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      {COPY.table.columns.updatedAt}
                    </dt>
                    <dd className="mt-1 tabular-nums">
                      {formatShortDate(content.updatedAt)}
                    </dd>
                  </div>
                </dl>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href={`${ADMIN_CONTENTS_PATH}/${content.id}/editar`}>
                    {COPY.table.edit}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>

          {pagination.totalPages > 1 ? (
            <nav
              aria-label={COPY.pagination.label}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                asChild={pagination.hasPreviousPage}
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
              >
                {pagination.hasPreviousPage ? (
                  <Link
                    href={buildAdminContentsHref(filters, pagination.page - 1)}
                  >
                    <ChevronLeft aria-hidden="true" />
                    {COPY.pagination.previous}
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft aria-hidden="true" />
                    {COPY.pagination.previous}
                  </span>
                )}
              </Button>
              <span className="text-muted-foreground text-sm tabular-nums">
                {COPY.pagination.status
                  .replace('{page}', String(pagination.page))
                  .replace('{total}', String(pagination.totalPages))}
              </span>
              <Button
                asChild={pagination.hasNextPage}
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
              >
                {pagination.hasNextPage ? (
                  <Link
                    href={buildAdminContentsHref(filters, pagination.page + 1)}
                  >
                    {COPY.pagination.next}
                    <ChevronRight aria-hidden="true" />
                  </Link>
                ) : (
                  <span>
                    {COPY.pagination.next}
                    <ChevronRight aria-hidden="true" />
                  </span>
                )}
              </Button>
            </nav>
          ) : null}
        </>
      ) : (
        <section className="bg-card rounded-2xl border border-dashed px-6 py-14 text-center">
          <SearchX
            className="text-muted-foreground mx-auto size-8"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-semibold">
            {hasFilters || pagination.total > 0
              ? COPY.empty.filtered.title
              : COPY.empty.database.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            {hasFilters || pagination.total > 0
              ? COPY.empty.filtered.description
              : COPY.empty.database.description}
          </p>
          {!hasFilters && pagination.total === 0 ? (
            <Button asChild className="mt-6">
              <Link href={`${ADMIN_CONTENTS_PATH}/novo`}>
                <Plus aria-hidden="true" />
                {COPY.createAction}
              </Link>
            </Button>
          ) : null}
        </section>
      )}
    </div>
  )
}
