import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * Layout raiz do namespace `/admin/*`. Não desenha chrome — o login e o aviso de
 * acesso restrito são telas isoladas. O chrome do painel vive em
 * `app/admin/(painel)/layout.tsx`, que também faz o gate de role.
 *
 * Serve para marcar toda a área admin como `noindex`.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
