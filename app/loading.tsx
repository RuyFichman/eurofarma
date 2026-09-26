import { Skeleton } from '@/components/ui/skeleton'
import { LOADING } from '@/lib/i18n/pt-br'

export default function ApplicationLoading() {
  return (
    <main
      className="bg-background flex min-h-svh items-center justify-center px-6"
      aria-busy="true"
    >
      <p role="status" className="sr-only">
        {LOADING.application}
      </p>

      <div className="w-full max-w-sm space-y-5" aria-hidden="true">
        <Skeleton className="mx-auto size-14 rounded-2xl" />
        <Skeleton className="mx-auto h-7 w-40" />
        <Skeleton className="mx-auto h-4 w-64 max-w-full" />
        <div className="bg-card space-y-4 rounded-2xl border p-6 shadow-sm">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </main>
  )
}
