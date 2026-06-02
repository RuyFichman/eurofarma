import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

type ContentSectionHeaderProps = {
  icon: LucideIcon
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}

export function ContentSectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: ContentSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="bg-secondary text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-primary text-xs font-semibold tracking-wider uppercase">
            {eyebrow}
          </p>
          <h2>{title}</h2>
          {description ? (
            <p className="text-muted-foreground max-w-xl">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="sm:pt-2">{action}</div> : null}
    </div>
  )
}
