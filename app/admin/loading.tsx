import { Skeleton } from '@/components/ui/skeleton'
import { LOADING } from '@/lib/i18n/pt-br'

export default function AdminLoading() {
  return (
    <main className="bg-background min-h-svh" aria-busy="true">
      <p role="status" className="sr-only">
        {LOADING.adminAccess}
      </p>

      <section
        className="flex min-h-svh items-center justify-center px-4 py-12"
        aria-hidden="true"
      >
        <div className="w-full max-w-md">
          <Skeleton className="mx-auto mb-8 h-6 w-32" />
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <Skeleton className="mx-auto h-4 w-24" />
            <Skeleton className="mx-auto mt-3 h-8 w-52" />
            <Skeleton className="mx-auto mt-3 h-4 w-4/5" />
            <Skeleton className="mt-8 h-10 w-full" />
            <Skeleton className="mt-4 h-10 w-full" />
            <Skeleton className="mt-6 h-10 w-full rounded-lg" />
          </div>
        </div>
      </section>
    </main>
  )
}
