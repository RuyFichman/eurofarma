import { Skeleton } from '@/components/ui/skeleton'
import { LOADING } from '@/lib/i18n/pt-br'

export default function NutrizAreaLoading() {
  return (
    <section
      className="bg-muted/35 min-h-[calc(100dvh-3.5rem)] px-4 py-8 sm:px-6 md:min-h-[calc(100dvh-4rem)] md:py-12"
      aria-busy="true"
    >
      <p role="status" className="sr-only">
        {LOADING.nutriz}
      </p>

      <div className="mx-auto max-w-6xl" aria-hidden="true">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-56 max-w-[60vw]" />
            </div>
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-5 max-w-xl" />

        <div className="bg-card mt-8 rounded-2xl border p-6 shadow-sm">
          <Skeleton className="h-6 w-48" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl border p-6 shadow-sm"
            >
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-6 h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
