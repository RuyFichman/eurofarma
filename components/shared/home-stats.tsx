import { Baby, Building2, Heart, MapPin } from 'lucide-react'

import { HOME } from '@/lib/i18n/pt-br'

const ICONS = [Building2, Heart, Baby, MapPin]

export function HomeStats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {HOME.stats.items.map((stat, index) => {
          const Icon = ICONS[index] ?? Heart
          return (
            <li
              key={stat.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="bg-secondary text-secondary-foreground flex size-12 items-center justify-center rounded-full">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span className="text-primary text-3xl font-bold md:text-4xl">
                {stat.value}
              </span>
              <span className="text-muted-foreground text-sm">
                {stat.label}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
