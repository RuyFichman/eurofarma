import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils/cn'

type ContentSectionHeaderProps = {
  /** Opcional: "Comece por Aqui" usa o cabeçalho sem ícone. */
  icon?: LucideIcon
  eyebrow: string
  title: string
  description?: string
  /**
   * `below` (padrão) empilha a descrição sob o título. `beside` a coloca numa
   * coluna ao lado, como no mockup do "Comece por Aqui" — em telas estreitas
   * ela volta a empilhar de qualquer forma.
   */
  descriptionPlacement?: 'below' | 'beside'
  /**
   * `start` (padrão) alinha o cabeçalho à esquerda. `center` reproduz o
   * cabeçalho centrado de "O Caminho do Leite" (ícone, eyebrow, título e
   * descrição empilhados no eixo central) e ignora `descriptionPlacement`,
   * porque ali a descrição sempre fica sob o título.
   */
  align?: 'start' | 'center'
  action?: ReactNode
  /**
   * Sobrescreve o estilo padrão do `<h2>` (definido globalmente em
   * globals.css). Usado quando uma seção específica precisa igualar o título
   * de outra seção com header próprio, como "O Caminho do Leite".
   */
  titleClassName?: string
}

export function ContentSectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  descriptionPlacement = 'below',
  align = 'start',
  action,
  titleClassName,
}: ContentSectionHeaderProps) {
  const centered = align === 'center'
  const beside = !centered && descriptionPlacement === 'beside'

  if (centered) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {Icon ? (
          <span className="bg-secondary text-primary mb-5 flex size-12 items-center justify-center rounded-2xl">
            <Icon className="size-6" aria-hidden="true" />
          </span>
        ) : null}
        <p className="text-primary text-xs font-medium tracking-[0.24em] uppercase">
          {eyebrow}
        </p>
        <h2 className={cn('mt-5', titleClassName)}>{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-4 text-sm text-pretty md:text-base">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div
        className={
          beside
            ? 'flex flex-col gap-4 md:flex-row md:items-center md:gap-8'
            : 'flex items-start gap-4'
        }
      >
        <div className="flex items-start gap-4">
          {Icon ? (
            <span className="bg-secondary text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
              <Icon className="size-6" aria-hidden="true" />
            </span>
          ) : null}
          <div className="space-y-1">
            <p className="text-primary text-xs font-semibold tracking-wider uppercase">
              {eyebrow}
            </p>
            <h2 className={titleClassName}>{title}</h2>
            {description && !beside ? (
              <p className="text-muted-foreground max-w-xl">{description}</p>
            ) : null}
          </div>
        </div>

        {description && beside ? (
          <p className="text-muted-foreground max-w-sm text-sm text-pretty">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="sm:pt-2">{action}</div> : null}
    </div>
  )
}
