import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/app/admin/login/login-form'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ADMIN_LOGIN } from '@/lib/i18n/pt-br'

export const metadata: Metadata = {
  title: ADMIN_LOGIN.seo.title,
  description: ADMIN_LOGIN.seo.description,
}

export default async function AdminLoginPage() {
  // Já autenticado → vai direto ao painel (o dashboard chega na Sprint 5.3;
  // até lá esse destino pode dar 404, o que é aceitável neste sprint).
  const user = await getCurrentUser()
  if (user) {
    redirect('/admin/dashboard')
  }

  return (
    <main className="bg-background min-h-svh">
      <section className="flex min-h-svh items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <p className="text-primary mb-8 text-center text-lg font-semibold tracking-tight">
            {ADMIN_LOGIN.brand.name}
          </p>

          <Card>
            <CardContent>
              <div className="mb-6 space-y-2 text-center">
                <p className="text-primary text-xs font-medium tracking-wide uppercase">
                  {ADMIN_LOGIN.brand.eyebrow}
                </p>
                <h1 className="text-2xl leading-none font-semibold">
                  {ADMIN_LOGIN.hero.title}
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {ADMIN_LOGIN.hero.description}
                </p>
              </div>

              <LoginForm />
            </CardContent>
          </Card>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            {ADMIN_LOGIN.hero.restrictedNotice}
          </p>
        </div>
      </section>
    </main>
  )
}
