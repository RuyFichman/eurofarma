import { AdminMobileNav } from '@/components/admin/admin-mobile-nav'
import { AdminUserMenu } from '@/components/admin/admin-user-menu'
import type { AdminUser } from '@/lib/auth/get-admin-user'
import { ADMIN_LAYOUT } from '@/lib/i18n/pt-br'

type AdminHeaderProps = {
  user: AdminUser
}

/**
 * Topbar do painel (Server Component): gatilho do menu mobile, identificação da
 * área e conta. Nada do Header público entra aqui — as duas áreas não se cruzam.
 */
export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-background/95 sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur md:px-6 lg:px-8">
      <AdminMobileNav userName={user.fullName} userEmail={user.email} />

      <span className="text-sm font-semibold tracking-tight lg:hidden">
        {ADMIN_LAYOUT.brand.fullName}
      </span>
      <span className="text-muted-foreground hidden text-sm lg:inline">
        {ADMIN_LAYOUT.header.areaLabel}
      </span>

      <div className="flex-1" />

      <AdminUserMenu user={user} />
    </header>
  )
}
