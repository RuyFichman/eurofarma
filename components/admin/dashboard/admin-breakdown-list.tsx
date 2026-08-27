import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCount, percentOf } from '@/lib/utils/format-number'

export type BreakdownItem = {
  /** Chave estável para o React — não é exibida. */
  id: string
  label: string
  count: number
}

type AdminBreakdownListProps = {
  title: string
  description: string
  items: BreakdownItem[]
  /**
   * Explicação exibida quando não há nada a contar. Aparece tanto com a lista
   * vazia quanto com a lista cheia de zeros: nos dois casos "0" sozinho não
   * conta a história.
   */
  emptyMessage: string
}

/**
 * Lista de contagens por categoria (situação, tipo, UF) — Server Component.
 *
 * Usa `<dl>` pelo mesmo motivo dos cartões: são pares nome/valor, e a lista de
 * definição faz o leitor de tela anunciar os dois juntos. A barra de proporção
 * é puramente decorativa (`aria-hidden`) — o número sempre aparece como texto,
 * então nenhuma informação depende só de cor ou de largura.
 */
export function AdminBreakdownList({
  title,
  description,
  items,
  emptyMessage,
}: AdminBreakdownListProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const isEmpty = items.length === 0 || total === 0

  return (
    <Card>
      <CardHeader>
        {/* `CardTitle` é um `div` estilizado; o `h2` dentro dele dá o heading
            real que o leitor de tela usa para navegar entre os blocos. */}
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.length > 0 ? (
          <dl className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm">{item.label}</dt>
                  <dd className="text-sm font-semibold tabular-nums">
                    {formatCount(item.count)}
                  </dd>
                </div>
                <div
                  className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
                  aria-hidden
                >
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${percentOf(item.count, total)}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>
        ) : null}

        {isEmpty ? (
          <p className="text-muted-foreground text-sm text-pretty">
            {emptyMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
