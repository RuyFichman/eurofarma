import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { DashboardTopUnit } from '@/lib/db/queries/dashboard-metrics'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatCount } from '@/lib/utils/format-number'

const COPY = ADMIN.dashboard.topUnits

type AdminTopUnitsProps = {
  units: DashboardTopUnit[]
  periodDays: number
}

/**
 * Ranking das unidades mais contatadas por WhatsApp — Server Component.
 *
 * Unidades são entidades públicas (nome, cidade, UF já aparecem na busca), então
 * exibi-las aqui não levanta questão de privacidade. O que **não** aparece é
 * qualquer vínculo com quem clicou: a agregação é por unidade, e `WhatsappClick`
 * não guarda dado pessoal.
 *
 * Tabela semântica de verdade (`<th scope="col">` + `<caption>`) em vez de divs:
 * é uma grade de dados, e o leitor de tela precisa associar célula e coluna.
 */
export function AdminTopUnits({ units, periodDays }: AdminTopUnitsProps) {
  const description = COPY.description.replace('{days}', String(periodDays))

  return (
    <Card>
      <CardHeader>
        {/* `CardTitle` é um `div` estilizado; o `h2` dentro dele dá o heading
            real que o leitor de tela usa para navegar entre os blocos. */}
        <CardTitle>
          <h2>{COPY.title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {units.length > 0 ? (
          // Rolagem própria da tabela: a página nunca rola na horizontal.
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[22rem] text-sm">
              <caption className="sr-only">
                {COPY.title} — {description}
              </caption>
              <thead>
                <tr className="text-muted-foreground border-b text-left">
                  <th scope="col" className="pr-3 pb-2 font-medium">
                    {COPY.columns.unit}
                  </th>
                  <th scope="col" className="pr-3 pb-2 font-medium">
                    {COPY.columns.location}
                  </th>
                  <th scope="col" className="pb-2 text-right font-medium">
                    {COPY.columns.clicks}
                  </th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.unitId} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{unit.name}</td>
                    <td className="text-muted-foreground py-2.5 pr-3">
                      {unit.city} - {unit.state}
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">
                      {formatCount(unit.clicks)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-pretty">
            {COPY.empty}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
