'use client'

import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'

import { AdminNav } from '@/components/admin/admin-nav'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ADMIN } from '@/lib/i18n/pt-br'

type AdminMobileMenuProps = {
  /**
   * Bloco de conta renderizado no servidor e injetado como slot — mantém a
   * Server Action de logout fora do bundle do cliente.
   */
  account: ReactNode
}

export function AdminMobileMenu({ account }: AdminMobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={ADMIN.a11y.openMenu}>
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        aria-label={ADMIN.a11y.nav}
        className="bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col p-0"
      >
        <SheetTitle className="text-sidebar-foreground px-5 pt-5 text-base">
          {ADMIN.brand.name}
        </SheetTitle>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>

        <div className="border-sidebar-border border-t p-4">{account}</div>
      </SheetContent>
    </Sheet>
  )
}
