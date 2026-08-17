import Link from 'next/link'
import { ExternalLink, LogOut } from 'lucide-react'

import { logoutAdminAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import type { AdminUser } from '@/lib/auth/get-admin-user'
import { ADMIN } from '@/lib/i18n/pt-br'

type AdminAccountProps = {
  user: AdminUser
}

/**
 * Bloco de conta do painel (Server Component): identifica a sessão e expõe a
 * saída. O logout é um `<form>` com Server Action — sem JS de cliente.
 */
export function AdminAccount({ user }: AdminAccountProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sidebar-foreground/60 text-xs">
          {ADMIN.account.sessionLabel}
        </p>
        <p className="truncate text-sm font-medium">{user.fullName}</p>
        <p className="text-sidebar-foreground/70 truncate text-xs">
          {user.email}
        </p>
        <span className="border-sidebar-border text-sidebar-foreground/80 mt-1 inline-block rounded-full border px-2 py-0.5 text-[0.625rem] tracking-wide uppercase">
          {ADMIN.account.roleLabel[user.role]}
        </span>
      </div>

      <div className="space-y-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full justify-start"
        >
          <Link href="/">
            <ExternalLink className="size-4" aria-hidden="true" />
            {ADMIN.account.backToSite}
          </Link>
        </Button>

        <form action={logoutAdminAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full justify-start border"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {ADMIN.account.logout}
          </Button>
        </form>
      </div>
    </div>
  )
}
