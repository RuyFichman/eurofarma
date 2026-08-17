import { LogOut } from 'lucide-react'

import { logoutAdminAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import type { AdminUser } from '@/lib/auth/get-admin-user'
import { ADMIN_LAYOUT } from '@/lib/i18n/pt-br'

type AdminUserMenuProps = {
  user: AdminUser
}

/**
 * Identificação da sessão + logout (Server Component).
 *
 * Sem DropdownMenu de propósito: são dois elementos, e o `<form>` com Server
 * Action funciona sem JS de cliente. Nome e role vêm do mesmo `requireAdminUser()`
 * que já roda no gate do layout — nenhuma query extra, e nada é inventado.
 */
export function AdminUserMenu({ user }: AdminUserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm leading-tight font-medium">{user.fullName}</p>
        <p className="text-muted-foreground text-xs leading-tight">
          {user.email}
        </p>
      </div>

      <span className="text-muted-foreground hidden rounded-full border px-2 py-0.5 text-[0.625rem] tracking-wide uppercase md:inline">
        {ADMIN_LAYOUT.account.roleLabel[user.role]}
      </span>

      <form action={logoutAdminAction}>
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="size-4" aria-hidden="true" />
          {ADMIN_LAYOUT.account.logout}
        </Button>
      </form>
    </div>
  )
}
