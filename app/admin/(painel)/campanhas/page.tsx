import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Megaphone,
  Plus,
  SearchX,
} from 'lucide-react'

import { AdminCampaignLink } from '@/components/admin/campaigns/admin-campaign-link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ADMIN_CAMPAIGNS_PATH,
  buildAdminCampaignsHref,
  hasActiveAdminCampaignFilters,
  parseAdminCampaignFilters,
  type AdminCampaignsSearchParams,
} from '@/lib/admin/campaigns/filters'
import { buildTrackedCampaignHref } from '@/lib/admin/campaigns/tracked-url'
import { getAdminCampaigns } from '@/lib/db/queries/campaigns'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.campaigns

export const metadata: Metadata = {
  title: COPY.seo.title,
  description: COPY.seo.description,
}

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<AdminCampaignsSearchParams>
}) {
  const filters = parseAdminCampaignFilters(await searchParams)
  const { campaigns, sources, pagination } = await getAdminCampaigns(filters)
  const hasFilters = hasActiveAdminCampaignFilters(filters)
  const countLabel =
    pagination.total === 1 ? COPY.results.countOne : COPY.results.countOther

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="bg-primary/10 text-primary mb-3 flex size-10 items-center justify-center rounded-xl">
            <Megaphone className="size-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {COPY.title}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-6">
            {COPY.description}
          </p>
        </div>
        <Button asChild>
          <Link href={`${ADMIN_CAMPAIGNS_PATH}/novo`}>
            <Plus aria-hidden="true" />
            {COPY.createAction}
          </Link>
        </Button>
      </header>

      <Alert>
        <Info aria-hidden="true" />
        <AlertDescription>{COPY.attributionNotice}</AlertDescription>
      </Alert>

      <form
        method="get"
        aria-label={COPY.filters.label}
        className="bg-card grid gap-4 rounded-2xl border p-5 shadow-sm md:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.4fr)_minmax(10rem,0.45fr)_auto] md:items-end"
      >
        <div className="space-y-2">
          <Label htmlFor="campaigns-q">{COPY.filters.search.label}</Label>
          <Input
            id="campaigns-q"
            name="q"
            defaultValue={filters.query}
            placeholder={COPY.filters.search.placeholder}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaigns-status">{COPY.filters.status.label}</Label>
          <select
            id="campaigns-status"
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
          <Label htmlFor="campaigns-source">{COPY.filters.source.label}</Label>
          <select
            id="campaigns-source"
            name="source"
            defaultValue={filters.source}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="">{COPY.filters.source.all}</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {hasFilters ? (
            <Button asChild type="button" variant="outline">
              <Link href={ADMIN_CAMPAIGNS_PATH}>
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

      {campaigns.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-2xl border xl:block">
            <table className="bg-card w-full text-sm">
              <caption className="sr-only">{COPY.table.caption}</caption>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.campaign}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.sourceMedium}
                  </th>
                  <th scope="col" className="w-[34%] px-5 py-3 font-medium">
                    {COPY.table.columns.link}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.status}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {COPY.table.columns.createdAt}
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    {COPY.table.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const href = buildTrackedCampaignHref(campaign)
                  return (
                    <tr key={campaign.id} className="border-t align-top">
                      <th
                        scope="row"
                        className="max-w-64 px-5 py-4 text-left font-medium"
                      >
                        <span className="block text-pretty">
                          {campaign.name}
                        </span>
                        <span className="text-muted-foreground mt-1 block truncate text-xs font-normal">
                          {COPY.table.identifierLabel.replace(
                            '{value}',
                            campaign.utmCampaign,
                          )}
                        </span>
                      </th>
                      <td className="px-5 py-4">
                        <span className="font-medium">
                          {campaign.utmSource}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          {campaign.utmMedium}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <AdminCampaignLink
                          href={href}
                          name={campaign.name}
                          compact
                        />
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={campaign.isActive ? 'default' : 'secondary'}
                        >
                          {campaign.isActive
                            ? COPY.table.active
                            : COPY.table.inactive}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground px-5 py-4 tabular-nums">
                        {formatShortDate(campaign.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`${ADMIN_CAMPAIGNS_PATH}/${campaign.id}/editar`}
                            aria-label={COPY.table.editAria.replace(
                              '{name}',
                              campaign.name,
                            )}
                          >
                            {COPY.table.edit}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-4 xl:hidden">
            {campaigns.map((campaign) => {
              const href = buildTrackedCampaignHref(campaign)
              return (
                <li
                  key={campaign.id}
                  className="bg-card rounded-2xl border p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-pretty">
                        {campaign.name}
                      </h2>
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {COPY.table.identifierLabel.replace(
                          '{value}',
                          campaign.utmCampaign,
                        )}
                      </p>
                    </div>
                    <Badge
                      variant={campaign.isActive ? 'default' : 'secondary'}
                    >
                      {campaign.isActive
                        ? COPY.table.active
                        : COPY.table.inactive}
                    </Badge>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        {COPY.table.columns.sourceMedium}
                      </dt>
                      <dd className="mt-1">
                        {campaign.utmSource} / {campaign.utmMedium}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        {COPY.table.columns.createdAt}
                      </dt>
                      <dd className="mt-1 tabular-nums">
                        {formatShortDate(campaign.createdAt)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <AdminCampaignLink
                      href={href}
                      name={campaign.name}
                      compact
                    />
                  </div>
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link
                      href={`${ADMIN_CAMPAIGNS_PATH}/${campaign.id}/editar`}
                    >
                      {COPY.table.edit}
                    </Link>
                  </Button>
                </li>
              )
            })}
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
                    href={buildAdminCampaignsHref(filters, pagination.page - 1)}
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
                    href={buildAdminCampaignsHref(filters, pagination.page + 1)}
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
              <Link href={`${ADMIN_CAMPAIGNS_PATH}/novo`}>
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
