import Link from 'next/link'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ADMIN_UNIT_STATUS_VALUES,
  ADMIN_UNIT_TYPE_VALUES,
  ADMIN_UNITS_PATH,
  hasActiveAdminUnitFilters,
  type AdminUnitFilters,
} from '@/lib/admin/units/filters'
import {
  getAdminUnitStatusLabel,
  getAdminUnitTypeLabel,
} from '@/lib/admin/units/labels'
import { BRAZILIAN_STATES } from '@/lib/constants/brazilian-states'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.units.filters

/**
 * `<select>` nativo com o visual do `Input` do design system. O `Select` do
 * shadcn é Radix (Client Component) e não envia valor em submit de formulário
 * sem estado no cliente — aqui o formulário é GET puro, então o controle
 * nativo é o que mantém a tela funcionando sem JS.
 */
const SELECT_CLASSNAME =
  'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm'

/**
 * Filtros da listagem de unidades — **Server Component** com formulário GET
 * nativo.
 *
 * Escolha deliberada em vez do padrão da busca pública (3.3, Client + RHF +
 * `router.replace`): aqui não há campo dependente (a cidade é texto livre, não
 * um select alimentado por API), então um form nativo entrega o mesmo resultado
 * com zero JS, funciona com teclado por construção e deixa a URL
 * compartilhável. Como o form não tem campo `page`, submeter já volta para a
 * primeira página — sem código para "resetar" nada.
 */
export function AdminUnitsFilters({ filters }: { filters: AdminUnitFilters }) {
  const showClear = hasActiveAdminUnitFilters(filters)

  return (
    <Card className="py-5">
      <CardContent>
        <form
          method="get"
          action={ADMIN_UNITS_PATH}
          aria-label={COPY.label}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="admin-units-q">{COPY.search.label}</Label>
              <Input
                id="admin-units-q"
                name="q"
                type="search"
                maxLength={100}
                defaultValue={filters.query ?? ''}
                placeholder={COPY.search.placeholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-units-status">{COPY.status.label}</Label>
              <select
                id="admin-units-status"
                name="status"
                defaultValue={filters.status ?? ''}
                className={SELECT_CLASSNAME}
              >
                <option value="">{COPY.status.all}</option>
                {ADMIN_UNIT_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {getAdminUnitStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-units-type">{COPY.type.label}</Label>
              <select
                id="admin-units-type"
                name="type"
                defaultValue={filters.type ?? ''}
                className={SELECT_CLASSNAME}
              >
                <option value="">{COPY.type.all}</option>
                {ADMIN_UNIT_TYPE_VALUES.map((type) => (
                  <option key={type} value={type}>
                    {getAdminUnitTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-units-state">{COPY.state.label}</Label>
              <select
                id="admin-units-state"
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

            <div className="space-y-2">
              <Label htmlFor="admin-units-city">{COPY.city.label}</Label>
              <Input
                id="admin-units-city"
                name="city"
                maxLength={100}
                defaultValue={filters.city ?? ''}
                placeholder={COPY.city.placeholder}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">
              <Search aria-hidden="true" />
              {COPY.actions.apply}
            </Button>

            {/* Limpar é um link para a rota sem query: não precisa esvaziar
                campo a campo no cliente. */}
            {showClear ? (
              <Button asChild variant="ghost">
                <Link href={ADMIN_UNITS_PATH}>{COPY.actions.clear}</Link>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
