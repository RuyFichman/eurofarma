import Link from 'next/link'
import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

export function PersonalHistoryCard() {
  const copy = NUTRIZ_AUTH.area.personal.history

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-7">{copy.description}</p>
        <Button asChild className="mt-5">
          <Link href="/meu-agendamento/historico">
            <Download aria-hidden="true" />
            {copy.action}
          </Link>
        </Button>
        <p className="text-muted-foreground mt-3 text-xs leading-5">
          {copy.hint}
        </p>
      </CardContent>
    </Card>
  )
}
