import Link from 'next/link'
import { Download, FileDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

/**
 * O PDF é gerado no servidor a partir dos dados da própria nutriz, depois do
 * gate de sessão. Este card apenas oferece o download: ele não calcula nem
 * antecipa nenhum conteúdo do documento.
 */
export function JourneySummaryCard() {
  const copy = NUTRIZ_AUTH.area.personal.history

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
            <FileDown className="size-5" aria-hidden="true" />
          </span>
          {/* O h2 traz a semântica; o tamanho vem das classes, não da escala
              global de títulos, para casar com o CardTitle do card irmão. */}
          <h2 className="text-xl leading-tight font-semibold">{copy.title}</h2>
        </div>

        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {copy.description}
        </p>

        <Button asChild className="mt-auto w-fit">
          <Link href="/meu-agendamento/historico">
            <Download aria-hidden="true" />
            {copy.action}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
