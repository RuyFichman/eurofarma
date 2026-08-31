import Link from 'next/link'
import { SearchX, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ADMIN_NUTRIZES_PATH } from '@/lib/admin/nutrizes/filters'
import { ADMIN } from '@/lib/i18n/pt-br'

const COPY = ADMIN.nutrizes.empty

/**
 * Dois vazios diferentes, como na listagem de unidades — mas com uma diferença
 * importante: base vazia aqui **não tem call to action**. Não existe "cadastrar
 * primeira nutriz" pelo painel, e nem deveria: quem se cadastra é a própria
 * pessoa, com consentimento explícito. O texto explica por que a lista pode
 * estar legitimamente vazia em vez de sugerir uma ação impossível.
 */
export function AdminNutrizesEmptyState({
  variant,
}: {
  variant: 'database' | 'filtered'
}) {
  const isDatabaseEmpty = variant === 'database'
  const copy = isDatabaseEmpty ? COPY.database : COPY.filtered
  const Icon = isDatabaseEmpty ? Users : SearchX

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

        {isDatabaseEmpty ? null : (
          <Button asChild variant="outline" className="mt-5">
            <Link href={ADMIN_NUTRIZES_PATH}>{COPY.filtered.action}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
