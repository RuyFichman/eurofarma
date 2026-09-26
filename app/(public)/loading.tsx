import { Skeleton } from '@/components/ui/skeleton'
import { LOADING } from '@/lib/i18n/pt-br'

export default function PublicLoading() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        {LOADING.public}
      </p>

      <section className="bg-card border-b" aria-hidden="true">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-10 max-w-2xl md:h-14" />
          <Skeleton className="mt-3 h-10 max-w-xl" />
          <Skeleton className="mt-7 h-11 w-44 rounded-xl" />
        </div>
      </section>

      <section className="bg-muted/30 px-6 py-10 md:py-14" aria-hidden="true">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl border p-6 shadow-sm"
            >
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="mt-5 h-6 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
