'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/** A área da nutriz tem o cabeçalho compacto próprio do protótipo. */
export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/meu-agendamento') return null
  return <>{children}</>
}
