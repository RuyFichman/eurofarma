import Link from 'next/link'
import { LogIn, LogOut, Menu, UserRound, X } from 'lucide-react'

import { logoutNutrizAction } from '@/app/(nutriz)/meu-agendamento/actions'
import { Logo } from '@/components/shared/logo'
import { HeaderNavigation } from '@/components/shared/header-navigation'
import { getNutrizAccess } from '@/lib/auth/get-nutriz-user'
import { A11Y, NAV, NUTRIZ_AUTH } from '@/lib/i18n/pt-br'

/**
 * Cabeçalho público, renderizado no servidor.
 *
 * Ele consulta `getNutrizAccess()` porque um link "Entrar" para quem já tem
 * sessão é informação errada, não só um rótulo inconveniente. A consulta é
 * deduplicada pelo `cache` do React, então a área da nutriz — que já chama o
 * mesmo gate no layout — não paga uma segunda ida ao banco. O custo real é
 * outro e está assumido: ler cookie torna dinâmica a renderização das páginas
 * públicas que incluem este cabeçalho.
 *
 * `forbidden` (admin logado, ou perfil com soft delete) é tratado como visitante:
 * essas pessoas não têm Minha Área para onde voltar.
 */
export async function Header() {
  const access = await getNutrizAccess()
  const isNutriz = access.status === 'authenticated'

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      {/* Skip to content (acessibilidade — visível só ao focar via teclado) */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50"
      >
        {A11Y.skipToContent}
      </a>

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6 md:h-16">
        <Logo size="md" />

        <HeaderNavigation items={NAV.items} ariaLabel={A11Y.navMenu} />

        <div className="flex items-center gap-3">
          {isNutriz ? (
            <>
              <Link
                href="/meu-agendamento"
                className="text-foreground/80 hover:text-primary hidden items-center gap-1.5 text-sm transition-colors sm:inline-flex"
              >
                <UserRound className="size-4" aria-hidden="true" />
                {NUTRIZ_AUTH.header.account}
              </Link>
              <form action={logoutNutrizAction} className="hidden md:block">
                <button
                  type="submit"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {NUTRIZ_AUTH.header.logout}
                </button>
              </form>
            </>
          ) : (
            /* A rota decide se deve mostrar o login ou redirecionar uma nutriz
               que já possui sessão — este link é apenas o caminho feliz.
               Único CTA à direita: antes havia também um botão "Verificar
               cobertura" aqui, duplicando o mesmo item já presente no menu. */
            <Link
              href="/entrar"
              className="bg-primary text-primary-foreground hover:bg-background hover:text-primary hover:border-primary inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 text-sm font-medium whitespace-nowrap transition-colors"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {NUTRIZ_AUTH.header.login}
            </Link>
          )}

          {/* `details` preserva teclado e estado expandido sem hidratar Radix. */}
          <details className="group relative md:hidden">
            <summary className="hover:bg-accent focus-visible:ring-ring inline-flex size-9 cursor-pointer list-none items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <Menu className="size-5 group-open:hidden" aria-hidden="true" />
              <X
                className="hidden size-5 group-open:block"
                aria-hidden="true"
              />
              <span className="sr-only">
                <span className="group-open:hidden">{NAV.mobileMenu.open}</span>
                <span className="hidden group-open:inline">
                  {NAV.mobileMenu.close}
                </span>
              </span>
            </summary>
            <div className="bg-background absolute top-[calc(100%+0.75rem)] right-0 z-50 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border p-4 shadow-xl">
              <HeaderNavigation
                items={NAV.items}
                ariaLabel={A11Y.navMenu}
                mobile
              />
              {/* Sem sessão, o botão "Entrar" já fica sempre visível na barra
                  acima, inclusive no mobile — nada a repetir aqui. */}
              {isNutriz ? (
                <div className="mt-4 grid gap-2 border-t pt-4">
                  <Link
                    href="/meu-agendamento"
                    className="text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium"
                  >
                    <UserRound className="size-4" aria-hidden="true" />
                    {NUTRIZ_AUTH.header.account}
                  </Link>
                  <form action={logoutNutrizAction}>
                    <button
                      type="submit"
                      className="text-muted-foreground hover:bg-muted inline-flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      {NUTRIZ_AUTH.header.logout}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
