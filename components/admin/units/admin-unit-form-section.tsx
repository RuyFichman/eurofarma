import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'

/**
 * Bloco temático do formulário de unidade (Sprint 5.7).
 *
 * Existe para dar ao formulário uma hierarquia real: cada seção é um `h2` sob o
 * `h1` da página, então quem navega por cabeçalhos consegue pular direto para
 * "Contato" em vez de tabular por dezoito campos.
 *
 * Sem `'use client'`: é só marcação. Como quem o renderiza é um Client
 * Component, ele acompanha o bundle do cliente — mas não adiciona estado nem
 * efeito próprio.
 */
export function AdminUnitFormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        {/* `h2` direto, não `CardTitle`: o componente do shadcn é um `div` e
            aqui a hierarquia de cabeçalhos precisa ser real. */}
        <h2 className="text-lg leading-none font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <CardDescription className="text-pretty">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 md:grid-cols-2">{children}</div>
      </CardContent>
    </Card>
  )
}
