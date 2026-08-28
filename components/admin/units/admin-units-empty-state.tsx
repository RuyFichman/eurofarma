import Link from 'next/link'
import { Building2, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ADMIN_UNITS_PATH } from '@/lib/admin/units/filters'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.units.empty

/**
 * `database`: não existe unidade nenhuma cadastrada — o convite é criar a
 * primeira. `filtered`: existem unidades, mas nenhuma casa com os filtros — o
 * convite é limpar a busca. Trocar uma copy pela outra desorienta: sugerir
 * "cadastre a primeira unidade" para quem só digitou um nome inexistente faz o
 * painel parecer vazio quando não está.
 */
type AdminUnitsEmptyStateProps = {
  variant: 'database' | 'filtered'
}

export function AdminUnitsEmptyState({ variant }: AdminUnitsEmptyStateProps) {
  const isDatabaseEmpty = variant === 'database'
  const copy = isDatabaseEmpty ? COPY.database : COPY.filtered
  const Icon = isDatabaseEmpty ? Building2 : SearchX
  const href = isDatabaseEmpty ? `${ADMIN_UNITS_PATH}/nova` : ADMIN_UNITS_PATH

  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-10 text-center">
        <span className="bg-secondary text-secondary-foreground mb-4 flex size-12 items-center justify-center rounded-2xl">
          <Icon className="size-6" aria-hidden="true" />
        </span>

        <h2 className="text-base font-semibold">{copy.title}</h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm text-pretty">
          {copy.description}
        </p>

        <Button
          asChild
          variant={isDatabaseEmpty ? 'default' : 'outline'}
          className="mt-5"
        >
          <Link href={href}>{copy.action}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
