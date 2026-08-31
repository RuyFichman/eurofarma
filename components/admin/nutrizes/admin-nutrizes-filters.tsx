import Link from 'next/link'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ADMIN_NUTRIZ_STATUS_VALUES,
  ADMIN_NUTRIZES_PATH,
  hasActiveAdminNutrizFilters,
  type AdminNutrizFilters,
} from '@/lib/admin/nutrizes/filters'
import { getAdminNutrizStatusLabel } from '@/lib/admin/nutrizes/labels'
import { BRAZILIAN_STATES } from '@/lib/constants/brazilian-states'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.nutrizes.filters

/**
 * `<select>` nativo com o visual do `Input` do design system — mesma razão da
 * listagem de unidades: o `Select` do shadcn é Radix e não envia valor em submit
 * sem estado no cliente.
 */
const SELECT_CLASSNAME =
  'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm'

/**
 * Filtros da listagem de nutrizes — Server Component com formulário GET nativo.
 *
 * **Sem filtro por cidade**, diferente de unidades: cada linha aqui é uma
 * pessoa, e filtrar por município numa base pequena isola indivíduos. Estado
 * é granularidade suficiente para organizar atendimento.
 */
export function AdminNutrizesFilters({
  filters,
}: {
  filters: AdminNutrizFilters
}) {
  const showClear = hasActiveAdminNutrizFilters(filters)

  return (
    <Card className="py-5">
      <CardContent>
        <form
          method="get"
          action={ADMIN_NUTRIZES_PATH}
          aria-label={COPY.label}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="admin-nutrizes-q">{COPY.search.label}</Label>
              <Input
                id="admin-nutrizes-q"
                name="q"
                type="search"
                maxLength={100}
                defaultValue={filters.query ?? ''}
                placeholder={COPY.search.placeholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-nutrizes-status">{COPY.status.label}</Label>
              <select
                id="admin-nutrizes-status"
                name="status"
                defaultValue={filters.status ?? ''}
                className={SELECT_CLASSNAME}
              >
                <option value="">{COPY.status.all}</option>
                {ADMIN_NUTRIZ_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {getAdminNutrizStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-nutrizes-state">{COPY.state.label}</Label>
              <select
                id="admin-nutrizes-state"
                name="state"
                defaultValue={filters.state ?? ''}
                className={SELECT_CLASSNAME}
              >
                <option value="">{COPY.state.all}</option>
                {BRAZILIAN_STATES.map((state) => (
                  <option key={state.uf} value={state.uf}>
                    {state.uf} — {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">
              <Search aria-hidden="true" />
              {COPY.actions.apply}
            </Button>

            {showClear ? (
              <Button asChild variant="ghost">
                <Link href={ADMIN_NUTRIZES_PATH}>{COPY.actions.clear}</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
