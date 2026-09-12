import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, Plus, SearchX } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ADMIN_MUNICIPALITIES_PATH,
  buildAdminMunicipalitiesHref,
  hasActiveAdminMunicipalityFilters,
  parseAdminMunicipalityFilters,
  type AdminMunicipalitiesSearchParams,
} from '@/lib/admin/municipalities/filters'
import { SERVICE_REGION_VALUES } from '@/lib/constants/service-municipalities'
import { getAdminMunicipalities } from '@/lib/db/queries/service-municipalities'
import { ADMIN, COVERAGE } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.municipalities

export const metadata: Metadata = {
  title: COPY.seo.title,
  description: COPY.seo.description,
}

export default async function AdminMunicipalitiesPage({
  searchParams,
}: {
  searchParams: Promise<AdminMunicipalitiesSearchParams>
}) {
  const filters = parseAdminMunicipalityFilters(await searchParams)
  const { municipalities, pagination } = await getAdminMunicipalities(filters)
  const hasFilters = hasActiveAdminMunicipalityFilters(filters)
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
          <Link href={`${ADMIN_MUNICIPALITIES_PATH}/novo`}>
            <Plus aria-hidden="true" />
            {COPY.createAction}
          </Link>
        </Button>
      </div>

      <form
        method="get"
        aria-label={COPY.filters.label}
        className="bg-card grid gap-4 rounded-2xl border p-5 shadow-sm md:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.5fr)_minmax(12rem,0.7fr)_auto] md:items-end"
      >
        <div className="space-y-2">
          <Label htmlFor="municipalities-q">{COPY.filters.search.label}</Label>
          <Input
            id="municipalities-q"
            name="q"
            defaultValue={filters.query}
            placeholder={COPY.filters.search.placeholder}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="municipalities-status">
            {COPY.filters.status.label}
          </Label>
          <select
            id="municipalities-status"
            name="status"
            defaultValue={filters.status}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">{COPY.filters.status.all}</option>
            <option value="ACTIVE">{COPY.filters.status.active}</option>
            <option value="INACTIVE">{COPY.filters.status.inactive}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="municipalities-region">
            {COPY.filters.region.label}
          </Label>
          <select
            id="municipalities-region"
            name="region"
            defaultValue={filters.region}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">{COPY.filters.region.all}</option>
            {SERVICE_REGION_VALUES.map((region) => (
              <option key={region} value={region}>
                {COVERAGE.regions[region]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {hasFilters ? (
            <Button asChild type="button" variant="outline">
              <Link href={ADMIN_MUNICIPALITIES_PATH}>
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

      {municipalities.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-2xl border md:block">
            <table className="bg-card w-full text-sm">
              <caption className="sr-only">{COPY.table.caption}</caption>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.municipality}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.region}
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
                {municipalities.map((municipality) => (
                  <tr key={municipality.id} className="border-t">
                    <th scope="row" className="px-5 py-4 text-left font-medium">
                      <span className="flex items-center gap-2">
                        <MapPin
                          className="text-primary size-4"
                          aria-hidden="true"
                        />
                        {municipality.name}
                      </span>
                      <span className="text-muted-foreground mt-1 block text-xs font-normal">
                        {COPY.table.location.replace(
                          '{city}',
                          municipality.name,
                        )}
                      </span>
                    </th>
                    <td className="px-5 py-4">
                      {COVERAGE.regions[municipality.region]}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          municipality.isActive ? 'default' : 'secondary'
                        }
                      >
                        {municipality.isActive
                          ? COPY.table.active
                          : COPY.table.inactive}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-5 py-4 tabular-nums">
                      {formatShortDate(municipality.updatedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`${ADMIN_MUNICIPALITIES_PATH}/${municipality.id}/editar`}
                          aria-label={COPY.table.editAria.replace(
                            '{city}',
                            municipality.name,
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
            {municipalities.map((municipality) => (
              <li
                key={municipality.id}
                className="bg-card rounded-2xl border p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{municipality.name}</h2>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {COPY.table.location.replace('{city}', municipality.name)}
                    </p>
                  </div>
                  <Badge
                    variant={municipality.isActive ? 'default' : 'secondary'}
                  >
                    {municipality.isActive
                      ? COPY.table.active
                      : COPY.table.inactive}
                  </Badge>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      {COPY.table.columns.region}
                    </dt>
                    <dd className="mt-1">
                      {COVERAGE.regions[municipality.region]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      {COPY.table.columns.updatedAt}
                    </dt>
                    <dd className="mt-1">
                      {formatShortDate(municipality.updatedAt)}
                    </dd>
                  </div>
                </dl>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link
                    href={`${ADMIN_MUNICIPALITIES_PATH}/${municipality.id}/editar`}
                  >
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
                    href={buildAdminMunicipalitiesHref(
                      filters,
                      pagination.page - 1,
                    )}
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
                    href={buildAdminMunicipalitiesHref(
                      filters,
                      pagination.page + 1,
                    )}
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
            {hasFilters ? COPY.empty.filtered.title : COPY.empty.database.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            {hasFilters
              ? COPY.empty.filtered.description
              : COPY.empty.database.description}
          </p>
        </section>
      )}
    </div>
  )
}
