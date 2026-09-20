'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState, useTransition } from 'react'
import { ShieldCheck, Smartphone } from 'lucide-react'

import {
  deleteNutrizAccountAction,
  updateNutrizAccountAction,
} from '@/app/(nutriz)/meu-agendamento/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WhatsappIcon } from '@/components/shared/whatsapp-icon'
import { BRAZILIAN_STATES } from '@/lib/constants/brazilian-states'
import { LACTARE_CONTACT } from '@/lib/constants/lactare-contact'
import type { NutrizAccountData } from '@/lib/db/queries/nutriz-account'
import { NUTRIZ_AUTH } from '@/lib/i18n/pt-br'
import { formatShortDate } from '@/lib/utils/format-date'
import { maskBrazilianPhone } from '@/lib/utils/phone'

/** Iniciais para o avatar, sem depender de foto ou de dado extra. */
function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''
  return `${first}${last}`.toUpperCase()
}

export function NutrizAccountCard({ account }: { account: NutrizAccountData }) {
  const copy = NUTRIZ_AUTH.area.account
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(account.fullName)
  const [city, setCity] = useState(account.city)
  const [state, setState] = useState(account.state)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFeedback(null)
    startTransition(async () => {
      const result = await updateNutrizAccountAction({ fullName, city, state })
      if (!result.ok) {
        setError(
          result.fields?.fullName ??
            result.fields?.city ??
            result.fields?.state ??
            copy.error,
        )
        return
      }
      setIsEditing(false)
      setFeedback(copy.savedFeedback)
      router.refresh()
    })
  }

  function cancelEdit() {
    setFullName(account.fullName)
    setCity(account.city)
    setState(account.state)
    setError(null)
    setIsEditing(false)
  }

  function removeAccount() {
    if (!window.confirm(copy.deleteConfirm)) return
    setError(null)
    setFeedback(null)
    startTransition(async () => {
      const result = await deleteNutrizAccountAction()
      if (!result.ok) {
        setError(copy.error)
        return
      }
      router.replace('/')
      router.refresh()
    })
  }

  return (
    <section aria-labelledby="meus-dados-titulo">
      <h2 id="meus-dados-titulo" className="text-sm font-semibold">
        {copy.title}
      </h2>
      <Card className="mt-3">
        <CardContent>
          <div className="flex items-center gap-3">
            <span
              className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-full text-sm font-semibold"
              aria-hidden="true"
            >
              {initialsOf(account.fullName)}
            </span>
            <div>
              <p className="font-semibold">{account.fullName}</p>
              <p className="text-muted-foreground text-sm">
                {account.city}, {account.state}
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t pt-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground flex items-center gap-2">
                <Smartphone className="size-4" aria-hidden="true" />
                {copy.whatsappLabel}
              </dt>
              <dd className="font-medium">
                {maskBrazilianPhone(account.phoneWhatsapp) ??
                  account.phoneWhatsapp}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="size-4" aria-hidden="true" />
                {copy.consentLabel}
              </dt>
              <dd className="font-medium">
                {copy.consentValue.replace(
                  '{date}',
                  formatShortDate(account.lgpdConsentAt),
                )}
              </dd>
            </div>
          </dl>

          {isEditing ? (
            <form onSubmit={submit} className="mt-5 border-t pt-5">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem]">
                <div className="space-y-2">
                  <Label htmlFor="account-full-name">
                    {copy.fields.fullName}
                  </Label>
                  <Input
                    id="account-full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    disabled={isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-city">{copy.fields.city}</Label>
                  <Input
                    id="account-city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    disabled={isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-state">{copy.fields.state}</Label>
                  <Select
                    value={state}
                    onValueChange={setState}
                    disabled={isPending}
                  >
                    <SelectTrigger id="account-state" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((option) => (
                        <SelectItem key={option.uf} value={option.uf}>
                          {option.uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-xs leading-5">
                {copy.phoneNotice}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={isPending}>
                  {isPending ? copy.saving : copy.saveAction}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelEdit}
                  disabled={isPending}
                >
                  {copy.cancelAction}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-5 flex flex-wrap gap-3 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isPending}
              >
                {copy.editAction}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={removeAccount}
                disabled={isPending}
              >
                {isPending ? copy.deleting : copy.deleteAction}
              </Button>
            </div>
          )}

          {error ? (
            <p role="alert" className="text-destructive mt-3 text-sm">
              {error}
            </p>
          ) : null}
          {feedback ? (
            <p role="status" className="text-primary mt-3 text-sm">
              {feedback}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center">
        {/* Reafirma cor de texto e borda no hover: a variante "default" do
            Button inverte para fundo branco/texto azul ao passar o mouse, e
            esse botão precisa continuar verde (exceção documentada). */}
        <Button
          asChild
          className="bg-whatsapp-brand text-whatsapp-brand-foreground hover:bg-whatsapp-brand/90 hover:text-whatsapp-brand-foreground border-transparent hover:border-transparent"
        >
          <a
            href={LACTARE_CONTACT.whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsappIcon className="size-4" />
            {copy.contactAction}
          </a>
        </Button>
      </div>
    </section>
  )
}
