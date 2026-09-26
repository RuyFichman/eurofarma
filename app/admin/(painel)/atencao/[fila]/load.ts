import { notFound } from 'next/navigation'

import {
  parseActionCenterPage,
  parseActionCenterQueueSlug,
} from '@/lib/admin/action-center/queues'
import { requireAdminUser } from '@/lib/auth/get-admin-user'
import { getActionCenterQueuePage } from '@/lib/db/queries/admin-action-center'

export type ActionCenterQueueRouteProps = {
  params: Promise<{ fila: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

/**
 * Gate, validação e consulta do detalhamento, fora do JSX para poder ser
 * testado. O layout de `(painel)` já aplica o gate de role, mas layout e
 * página renderizam em paralelo e esta tela lista pessoas: a autorização é
 * repetida aqui, **antes** de qualquer consulta. Slug fora da lista fixa vira
 * 404, também sem consultar.
 */
export async function loadActionCenterQueueRoute({
  params,
  searchParams,
}: ActionCenterQueueRouteProps) {
  await requireAdminUser()

  const key = parseActionCenterQueueSlug((await params).fila)
  if (!key) notFound()

  const page = parseActionCenterPage((await searchParams).page)
  return getActionCenterQueuePage(key, page)
}
