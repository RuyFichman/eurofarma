import { Skeleton } from '@/components/ui/skeleton'
import { LOADING } from '@/lib/i18n/pt-br'

export default function AdminPanelLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <p role="status" className="sr-only">
        {LOADING.admin}
      </p>

      <div className="space-y-2" aria-hidden="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 max-w-xl" />
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-hidden="true"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-card rounded-xl border p-5 shadow-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-5 h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-36" />
          </div>
        ))}
      </div>

      <div
        className="bg-card rounded-xl border p-5 shadow-sm"
        aria-hidden="true"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
