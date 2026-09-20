import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SITE } from '@/lib/i18n/pt-br'

export const metadata = {
  title: `Style Guide — ${SITE.name} Digital`,
}

type ColorToken = { name: string; className: string; value: string }

// Os valores hex abaixo refletem os tokens hsl() de app/globals.css (paleta
// azul, seção 7 do AGENTS.md). Esta página já usava as classes reais
// (bg-primary etc.), então as caixinhas sempre renderizaram a cor certa —
// só os rótulos e os hex de referência tinham ficado presos numa paleta
// "Berry/Sage/Cream" anterior à decisão pelo azul.
const colorTokens: ColorToken[] = [
  { name: 'background', className: 'bg-background', value: '#FAFCFF' },
  { name: 'foreground', className: 'bg-foreground', value: '#1A2B3C' },
  { name: 'primary', className: 'bg-primary', value: '#3A7AB8' },
  {
    name: 'primary-foreground',
    className: 'bg-primary-foreground',
    value: '#FAFAFA',
  },
  { name: 'secondary', className: 'bg-secondary', value: '#D6EAFF' },
  {
    name: 'secondary-foreground',
    className: 'bg-secondary-foreground',
    value: '#223D59',
  },
  { name: 'accent', className: 'bg-accent', value: '#C1DDF6' },
  { name: 'muted', className: 'bg-muted', value: '#F1F5F9' },
  {
    name: 'muted-foreground',
    className: 'bg-muted-foreground',
    value: '#586674',
  },
  { name: 'destructive', className: 'bg-destructive', value: '#C11F1F' },
  { name: 'border', className: 'bg-border', value: '#CEE2F3' },
  { name: 'ring', className: 'bg-ring', value: '#3A7AB8' },
]

const chartTokens: ColorToken[] = [
  { name: 'chart-1', className: 'bg-chart-1', value: '#3A7AB8' },
  { name: 'chart-2', className: 'bg-chart-2', value: '#42946F' },
  { name: 'chart-3', className: 'bg-chart-3', value: '#5BA4D4' },
  { name: 'chart-4', className: 'bg-chart-4', value: '#EAA23E' },
  { name: 'chart-5', className: 'bg-chart-5', value: '#349DB2' },
]

// Exceções controladas à paleta azul (seção "CTAs de WhatsApp..." e "Atualização
// da Minha Área" do AGENTS.md): cada uma tem escopo restrito documentado em
// globals.css e não deve ser usada fora dele.
const exceptionTokens: ColorToken[] = [
  {
    name: 'whatsapp-brand',
    className: 'bg-whatsapp-brand',
    value: '#25D366',
  },
  {
    name: 'whatsapp-brand-foreground',
    className: 'bg-whatsapp-brand-foreground',
    value: '#FFFFFF',
  },
  { name: 'achievement', className: 'bg-achievement', value: '#D89F0E' },
  {
    name: 'achievement-foreground',
    className: 'bg-achievement-foreground',
    value: '#FFFFFF',
  },
  {
    name: 'achievement-soft',
    className: 'bg-achievement-soft',
    value: '#FEF9EB',
  },
  {
    name: 'achievement-soft-foreground',
    className: 'bg-achievement-soft-foreground',
    value: '#845B15',
  },
]

const spacings: { label: string; px: number }[] = [
  { label: '1', px: 4 },
  { label: '2', px: 8 },
  { label: '4', px: 16 },
  { label: '6', px: 24 },
  { label: '8', px: 32 },
  { label: '12', px: 48 },
  { label: '16', px: 64 },
]

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}): ReactNode {
  return (
    <section className="border-border space-y-6 border-t py-10 first:border-t-0 first:pt-0">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Swatch({ token }: { token: ColorToken }): ReactNode {
  return (
    <div className="space-y-2">
      <div
        className={`border-border h-16 w-full rounded-lg border ${token.className}`}
      />
      <div className="text-sm">
        <p className="font-medium">{token.name}</p>
        <p className="text-muted-foreground text-xs">{token.value}</p>
      </div>
    </div>
  )
}

export default function StyleGuidePage(): ReactNode {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="space-y-2 pb-6">
        <Badge variant="secondary">Referência interna</Badge>
        <h1>Style Guide — {SITE.name} Digital</h1>
        <p className="text-muted-foreground">
          Tokens visuais, tipografia e componentes base. Use esta página para
          validar a identidade ao longo do desenvolvimento.
        </p>
      </header>

      <Section title="Paleta de cores">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {colorTokens.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>
        <h3>Cores de gráfico (dashboard)</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {chartTokens.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>
        <h3>Exceções controladas (fora da paleta azul)</h3>
        <p className="text-muted-foreground text-sm">
          Uso restrito ao escopo documentado em cada token — ver comentários em{' '}
          <code>app/globals.css</code>.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {exceptionTokens.map((token) => (
            <Swatch key={token.name} token={token} />
          ))}
        </div>
      </Section>

      <Section title="Tipografia">
        <h1>Heading 1 — Toda gota importa</h1>
        <h2>Heading 2 — Doe leite materno</h2>
        <h3>Heading 3 — Verifique sua cidade</h3>
        <h4>Heading 4 — Como funciona a doação</h4>
        <p>
          Corpo de texto (body). Cada doação de leite materno pode ajudar
          recém-nascidos prematuros a crescerem mais fortes. É um gesto simples
          e cheio de cuidado.
        </p>
        <p className="text-sm">
          Texto pequeno (small) — usado em legendas e textos de apoio.
        </p>
        <p className="text-muted-foreground text-xs">
          Caption — informação secundária e metadados.
        </p>
      </Section>

      <Section title="Botões">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent>
              <p>Card simples, apenas com conteúdo.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Município atendido</CardTitle>
              <CardDescription>Osasco, São Paulo, Brazil</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Dentro da área de atuação configurada do Lactare.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Verificar cobertura</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section title="Inputs e formulários">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" placeholder="Maria Silva" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-erro">E-mail (com erro)</Label>
            <Input
              id="email-erro"
              aria-invalid="true"
              defaultValue="email-invalido"
            />
            <p className="text-destructive text-sm">E-mail inválido.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select>
              <SelectTrigger id="estado">
                <SelectValue placeholder="Selecione a UF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="lgpd" />
              <Label htmlFor="lgpd">Aceito a política de privacidade</Label>
            </div>
            <RadioGroup defaultValue="whatsapp" className="space-y-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="whatsapp" id="r-whatsapp" />
                <Label htmlFor="r-whatsapp">Contato por WhatsApp</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="email" id="r-email" />
                <Label htmlFor="r-email">Contato por e-mail</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      <Section title="Spacing">
        <div className="space-y-3">
          {spacings.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="text-muted-foreground w-16 text-sm">
                {s.label} ({s.px}px)
              </span>
              <div
                className="bg-primary h-4 rounded"
                style={{ width: `${s.px}px` }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Border radius">
        <div className="flex flex-wrap items-end gap-6">
          <div className="space-y-2">
            <div className="border-border bg-accent size-20 rounded-sm border" />
            <p className="text-muted-foreground text-xs">rounded-sm</p>
          </div>
          <div className="space-y-2">
            <div className="border-border bg-accent size-20 rounded-md border" />
            <p className="text-muted-foreground text-xs">rounded-md</p>
          </div>
          <div className="space-y-2">
            <div className="border-border bg-accent size-20 rounded-lg border" />
            <p className="text-muted-foreground text-xs">rounded-lg (10px)</p>
          </div>
        </div>
      </Section>

      <Section title="Shadows">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="bg-card h-24 rounded-lg shadow-sm" />
            <p className="text-muted-foreground text-xs">shadow-sm</p>
          </div>
          <div className="space-y-2">
            <div className="bg-card h-24 rounded-lg shadow-md" />
            <p className="text-muted-foreground text-xs">shadow-md</p>
          </div>
          <div className="space-y-2">
            <div className="bg-card h-24 rounded-lg shadow-lg" />
            <p className="text-muted-foreground text-xs">shadow-lg</p>
          </div>
        </div>
      </Section>
    </div>
  )
}
