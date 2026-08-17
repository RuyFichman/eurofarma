import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'

import { logoutAdminAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getAdminAccess } from '@/lib/auth/get-admin-user'
import { ADMIN } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: ADMIN.noAccess.seo.title,
  description: ADMIN.noAccess.seo.description,
}

/**
 * Destino de quem tem sessão válida mas não tem permissão de administração.
 * Fica fora do route group `(painel)` — se herdasse aquele layout, o próprio
 * gate de role a redirecionaria para cá em loop.
 */
export default async function AdminNoAccessPage() {
  // Quem tem permissão não deve ficar preso neste aviso.
  const access = await getAdminAccess()
  if (access.status === 'authenticated') {
    redirect('/admin/dashboard')
  }

  return (
    <main className="bg-background min-h-svh">
      <section className="flex min-h-svh items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="space-y-5 text-center">
              <ShieldAlert
                className="text-primary mx-auto size-10"
                aria-hidden="true"
              />

              <div className="space-y-2">
                <h1 className="text-xl font-semibold tracking-tight text-balance">
                  {ADMIN.noAccess.title}
                </h1>
                <p className="text-muted-foreground text-sm leading-6 text-balance">
                  {ADMIN.noAccess.description}
                </p>
              </div>

              <div className="space-y-2">
                <form action={logoutAdminAction}>
                  <Button type="submit" className="w-full">
                    {ADMIN.account.logout}
                  </Button>
                </form>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">{ADMIN.account.backToSite}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
