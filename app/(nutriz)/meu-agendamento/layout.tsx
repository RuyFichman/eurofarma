import { requireNutrizUser } from '@/lib/auth/get-nutriz-user'

/**
 * Gate de **autorização** da área da nutriz (Sprint 6.3).
 *
 * O `middleware.ts` já barra quem não tem sessão, mas ele roda no Edge e não
 * alcança o Postgres — quem confere que a sessão pertence a uma nutriz (e não a
 * um admin) é o `requireNutrizUser()` aqui, que roda em Node com Prisma. Mesma
 * divisão de trabalho do painel (ver seção 13 do AGENTS.md).
 *
 * Consequência a respeitar: **toda tela nova da área entra dentro desta pasta**.
 * O route group `(nutriz)` mantém a área fora do chrome público sem alterar a
 * URL e sem depender de lógica cliente baseada no pathname.
 */
export default async function MeuAgendamentoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireNutrizUser()
  return <main id="main-content">{children}</main>
}
