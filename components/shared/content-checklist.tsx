'use client'

import { useState } from 'react'
import { ListChecks } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CONTENT } from '@/lib/i18n/pt-br'
import { cn } from '@/lib/utils/cn'

function ChecklistCard({
  groupIndex,
  title,
  subtitle,
  items,
  readyLabel,
}: {
  groupIndex: number
  title: string
  subtitle: string
  items: readonly string[]
  readyLabel: string
}) {
  const total = items.length
  const [checked, setChecked] = useState<boolean[]>(() =>
    items.map(() => false),
  )
  const doneCount = checked.filter(Boolean).length

  function toggle(index: number) {
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="bg-secondary text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
              <ListChecks className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3>{title}</h3>
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {doneCount}/{total} {readyLabel}
          </Badge>
        </div>

        <div className="bg-muted mt-4 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {items.map((item, index) => {
            const id = `checklist-${groupIndex}-item-${index}`
            const isChecked = checked[index] ?? false
            return (
              <li key={item}>
                <label
                  htmlFor={id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
                    isChecked
                      ? 'bg-secondary/40 border-primary/40'
                      : 'bg-card hover:bg-muted/50',
                  )}
                >
                  <Checkbox
                    id={id}
                    checked={isChecked}
                    onCheckedChange={() => toggle(index)}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      isChecked && 'text-muted-foreground line-through',
                    )}
                  >
                    {item}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export function ContentChecklist() {
  const { checklist } = CONTENT

  return (
    <section className="mx-auto max-w-5xl px-6 pt-16 md:pt-20">
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        {checklist.groups.map((group, index) => (
          <ChecklistCard
            key={group.title}
            groupIndex={index}
            title={group.title}
            subtitle={group.subtitle}
            items={group.items}
            readyLabel={checklist.readyLabel}
          />
        ))}
      </div>
    </section>
  )
}
