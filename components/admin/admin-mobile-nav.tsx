'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'

import { AdminNav } from '@/components/admin/admin-nav'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ADMIN_LAYOUT } from '@/lib/i18n/pt-br'

type AdminMobileNavProps = {
  /** Dados já resolvidos no servidor — só strings, nada de tipo do Prisma. */
  userName: string
  userEmail: string
}

/**
 * Navegação abaixo de `lg`. Reusa o mesmo `AdminNav` do desktop (nenhum rótulo
 * duplicado) e fecha o Sheet ao navegar. Foco e ESC ficam por conta do Radix.
 */
export function AdminMobileNav({ userName, userEmail }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={ADMIN_LAYOUT.header.openMenu}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SheetTitle className="flex h-16 shrink-0 items-center border-b px-6 text-base">
          {ADMIN_LAYOUT.brand.fullName}
        </SheetTitle>

        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>

        <Separator />
        <div className="p-4">
          <p className="text-muted-foreground text-xs">
            {ADMIN_LAYOUT.account.signedInAs}
          </p>
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="text-muted-foreground truncate text-xs">{userEmail}</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
