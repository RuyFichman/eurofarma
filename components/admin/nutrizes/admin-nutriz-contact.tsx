'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ADMIN } from '@/lib/i18n/pt-br'
import { formatBrazilianPhone, maskBrazilianPhone } from '@/lib/utils/phone'

const COPY = ADMIN.nutrizes.contact

/**
 * WhatsApp da nutriz, **mascarado por padrão**.
 *
 * Único Client Component desta tela. O número fica oculto até alguém pedir para
 * ver, porque a listagem mostra dados de pessoas reais e o painel é aberto em
 * demonstração com frequência — revelar linha a linha expõe só o contato de
 * quem vai ser atendido naquele momento.
 *
 * Isso é redução de exposição visual, não controle de acesso: o número chega ao
 * HTML de qualquer forma. Quem não pode vê-lo não deveria ter sessão de admin.
 */
export function AdminNutrizContact({
  phoneWhatsapp,
  fullName,
}: {
  phoneWhatsapp: string
  fullName: string
}) {
  const [revealed, setRevealed] = useState(false)

  const masked = maskBrazilianPhone(phoneWhatsapp)
  const formatted = formatBrazilianPhone(phoneWhatsapp)

  // Número que não normaliza (dado antigo ou torto) não vira "null" na tela:
  // mostra o que está guardado, para o admin conseguir corrigir na origem.
  const display = revealed ? (formatted ?? phoneWhatsapp) : (masked ?? '•••')

  const label = (revealed ? COPY.hideAria : COPY.revealAria).replace(
    '{name}',
    fullName,
  )

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-sm tabular-nums">{display}</span>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        aria-label={label}
        aria-pressed={revealed}
        onClick={() => setRevealed((current) => !current)}
      >
        {revealed ? (
          <EyeOff className="size-3.5" aria-hidden="true" />
        ) : (
          <Eye className="size-3.5" aria-hidden="true" />
        )}
        {revealed ? COPY.hide : COPY.reveal}
      </Button>
    </span>
  )
}
