'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BRAZILIAN_STATES,
  isBrazilianState,
} from '@/lib/constants/brazilian-states'
import {
  isPublicUnitType,
  type PublicUnitType,
} from '@/lib/constants/unit-types'
import {
  searchFiltersSchema,
  type SearchFiltersInput,
  type SearchFiltersValues,
} from '@/lib/validators/search-filters'
import { SEARCH } from '@/lib/i18n/pt-br'

const COPY = SEARCH.filters
const TYPE_ALL = 'all'

const TYPE_OPTIONS: ReadonlyArray<{ value: PublicUnitType; label: string }> = [
  { value: 'milk_bank', label: COPY.fields.type.options.milkBank },
  {
    value: 'collection_point',
    label: COPY.fields.type.options.collectionPoint,
  },
  { value: 'hospital', label: COPY.fields.type.options.hospital },
  { value: 'partner', label: COPY.fields.type.options.partner },
]

export function SearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [cities, setCities] = useState<string[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [citiesError, setCitiesError] = useState<string | null>(null)

  // Valores iniciais lidos da URL; params inválidos caem para vazio/default.
  const initialState = (searchParams.get('state') ?? '').toUpperCase()
  const initialType = searchParams.get('type') ?? ''
  const form = useForm<SearchFiltersInput, unknown, SearchFiltersValues>({
    resolver: zodResolver(searchFiltersSchema),
    defaultValues: {
      state: isBrazilianState(initialState) ? initialState : '',
      city: searchParams.get('city') ?? '',
      neighborhood: searchParams.get('neighborhood') ?? '',
      type: isPublicUnitType(initialType) ? initialType : '',
      hasWhatsapp: searchParams.get('has_whatsapp') === 'true',
    },
  })

  const selectedState = form.watch('state')

  // Busca cidades sempre que houver um estado válido. AbortController evita
  // race condition ao trocar de estado rápido e cancela na desmontagem.
  useEffect(() => {
    if (!selectedState || !isBrazilianState(selectedState)) {
      setCities([])
      setIsLoadingCities(false)
      setCitiesError(null)
      return
    }

    let active = true
    const controller = new AbortController()
    setIsLoadingCities(true)
    setCitiesError(null)
    setCities([])

    fetch(`/api/cities?state=${encodeURIComponent(selectedState)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('failed')
        const data: { cities?: unknown } = await response.json()
        if (!active) return
        setCities(Array.isArray(data.cities) ? (data.cities as string[]) : [])
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (!active) return
        setCitiesError(COPY.fields.city.errorLoading)
        setCities([])
      })
      .finally(() => {
        if (active) setIsLoadingCities(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [selectedState])

  function onSubmit(values: SearchFiltersValues) {
    const params = new URLSearchParams()
    params.set('state', values.state)
    if (values.city.trim()) params.set('city', values.city.trim())
    if (values.neighborhood.trim())
      params.set('neighborhood', values.neighborhood.trim())
    if (values.type) params.set('type', values.type)
    if (values.hasWhatsapp) params.set('has_whatsapp', 'true')

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  function handleClearFilters() {
    form.reset({
      state: '',
      city: '',
      neighborhood: '',
      type: '',
      hasWhatsapp: false,
    })
    setCities([])
    setCitiesError(null)
    setIsLoadingCities(false)
    router.push(pathname)
  }

  const stateError = form.formState.errors.state?.message
  const hasCities = cities.length > 0
  const cityPlaceholder = !selectedState
    ? COPY.fields.city.placeholderWithoutState
    : isLoadingCities
      ? COPY.fields.city.loading
      : !hasCities
        ? COPY.fields.city.empty
        : COPY.fields.city.placeholder

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-card rounded-2xl border p-4 shadow-sm md:p-6"
      noValidate
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{COPY.title}</h2>
        <p className="text-muted-foreground text-sm">{COPY.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Estado */}
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="filters-state">{COPY.fields.state.label}</Label>
          <Controller
            control={form.control}
            name="state"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue('city', '')
                  form.setValue('neighborhood', '')
                  setCitiesError(null)
                }}
              >
                <SelectTrigger
                  id="filters-state"
                  className="w-full"
                  aria-invalid={Boolean(stateError)}
                  aria-describedby={
                    stateError ? 'filters-state-error' : undefined
                  }
                >
                  <SelectValue placeholder={COPY.fields.state.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state.uf} value={state.uf}>
                      {state.uf} — {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {stateError ? (
            <p
              id="filters-state-error"
              role="alert"
              className="text-destructive text-sm"
            >
              {stateError}
            </p>
          ) : null}
        </div>

        {/* Cidade */}
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="filters-city">{COPY.fields.city.label}</Label>
          <Controller
            control={form.control}
            name="city"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue('neighborhood', '')
                }}
                disabled={!selectedState || isLoadingCities || !hasCities}
              >
                <SelectTrigger
                  id="filters-city"
                  className="w-full"
                  aria-describedby={
                    citiesError ? 'filters-city-status' : undefined
                  }
                >
                  <SelectValue placeholder={cityPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p
            id="filters-city-status"
            role="status"
            aria-live="polite"
            className={citiesError ? 'text-destructive text-sm' : 'sr-only'}
          >
            {citiesError ?? (isLoadingCities ? COPY.fields.city.loading : '')}
          </p>
        </div>

        {/* Bairro */}
        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <Label htmlFor="filters-neighborhood">
            {COPY.fields.neighborhood.label}
          </Label>
          <Input
            id="filters-neighborhood"
            placeholder={COPY.fields.neighborhood.placeholder}
            aria-describedby="filters-neighborhood-helper"
            {...form.register('neighborhood')}
          />
          <p
            id="filters-neighborhood-helper"
            className="text-muted-foreground text-xs"
          >
            {COPY.fields.neighborhood.helper}
          </p>
        </div>

        {/* Tipo */}
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="filters-type">{COPY.fields.type.label}</Label>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Select
                value={field.value ? field.value : TYPE_ALL}
                onValueChange={(value) =>
                  field.onChange(value === TYPE_ALL ? '' : value)
                }
              >
                <SelectTrigger id="filters-type" className="w-full">
                  <SelectValue placeholder={COPY.fields.type.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TYPE_ALL}>
                    {COPY.fields.type.options.all}
                  </SelectItem>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* WhatsApp */}
        <div className="flex items-center md:col-span-2 lg:col-span-1">
          <Controller
            control={form.control}
            name="hasWhatsapp"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filters-has-whatsapp"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
                <Label
                  htmlFor="filters-has-whatsapp"
                  className="text-sm font-normal"
                >
                  {COPY.fields.hasWhatsapp.label}
                </Label>
              </div>
            )}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleClearFilters}
          className="w-full sm:w-auto"
        >
          {COPY.actions.clear}
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {COPY.actions.submit}
        </Button>
      </div>
    </form>
  )
}
