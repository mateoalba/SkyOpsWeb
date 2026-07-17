// src/presentation/pages/flights/FlightsPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LogIn, RefreshCw, Search, X } from 'lucide-react'

import { useFlightsStore } from '@/presentation/store/flights.store'
import type { FlightFilters } from '@/application/dtos/flight-filters.dto'
import { FLIGHT_STATUS_LABELS } from '@/domain/enums/flight-status.enum'
import { FlightCard } from '@/presentation/components/flight-card'
import { Pagination } from '@/presentation/components/pagination'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'

const ORDERING_OPTIONS = [
  { value: 'salida_programada', label: 'Salida (más próxima primero)' },
  { value: '-salida_programada', label: 'Salida (más lejana primero)' },
  { value: 'numero_vuelo', label: 'Número de vuelo' },
  { value: 'duracion_min', label: 'Duración' },
]

const ALL_VALUE = '__all__'

interface FilterFormState {
  search: string
  estado: string
  origenCodigo: string
  destinoCodigo: string
  fecha: string
  ordering: string
}

const EMPTY_FORM: FilterFormState = {
  search: '',
  estado: ALL_VALUE,
  origenCodigo: '',
  destinoCodigo: '',
  fecha: '',
  ordering: 'salida_programada',
}

function formToFilters(form: FilterFormState): FlightFilters {
  const filters: FlightFilters = { ordering: form.ordering }
  if (form.search.trim()) filters.search = form.search.trim()
  if (form.estado !== ALL_VALUE) filters.estado = form.estado as FlightFilters['estado']
  if (form.origenCodigo.trim()) filters.origenCodigo = form.origenCodigo.trim().toUpperCase()
  if (form.destinoCodigo.trim()) filters.destinoCodigo = form.destinoCodigo.trim().toUpperCase()
  if (form.fecha) filters.fecha = form.fecha
  return filters
}

function FiltersBar({
  form,
  onChange,
  onSubmit,
  onClear,
}: {
  form: FilterFormState
  onChange: (patch: Partial<FilterFormState>) => void
  onSubmit: (event: FormEvent) => void
  onClear: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="mb-8 grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="N° de vuelo o código IATA"
          value={form.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="origen">Origen</Label>
        <Input
          id="origen"
          placeholder="UIO"
          maxLength={3}
          value={form.origenCodigo}
          onChange={(e) => onChange({ origenCodigo: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="destino">Destino</Label>
        <Input
          id="destino"
          placeholder="GYE"
          maxLength={3}
          value={form.destinoCodigo}
          onChange={(e) => onChange({ destinoCodigo: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" type="date" value={form.fecha} onChange={(e) => onChange({ fecha: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label>Estado</Label>
        <Select value={form.estado} onValueChange={(value) => onChange({ estado: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            {Object.entries(FLIGHT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
        <Label>Ordenar por</Label>
        <Select value={form.ordering} onValueChange={(value) => onChange({ ordering: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDERING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-2 sm:col-span-1 lg:col-span-3">
        <Button type="submit" className="flex-1">
          <Search className="h-4 w-4" />
          Buscar
        </Button>
        <Button type="button" variant="outline" onClick={onClear}>
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      </div>
    </form>
  )
}

function FlightsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FlightsError({ status, message, onRetry }: { status: number; message: string; onRetry: () => void }) {
  if (status === 401) {
    return (
      <Card className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Inicia sesión para ver los vuelos</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
          <Link to="/login">
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-destructive/10">
        <RefreshCw className="h-6 w-6 text-destructive" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">No se pudieron cargar los vuelos</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="lg" onClick={onRetry} className="w-full rounded-full sm:w-auto">
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </Button>
    </Card>
  )
}

export default function FlightsPage() {
  const { flights, isLoading, error, total, totalPages, currentPage, fetchFlights, goToPage } = useFlightsStore()
  const [searchParams] = useSearchParams()

  // El Home (buscador del hero) y el header (buscador rápido) navegan acá
  // con query params (?search=, ?origen=, ?destino=, ?fecha=) — los leemos
  // una sola vez al montar para que los filtros lleguen ya aplicados.
  const initialForm: FilterFormState = {
    ...EMPTY_FORM,
    search: searchParams.get('search') ?? '',
    origenCodigo: (searchParams.get('origen') ?? '').toUpperCase(),
    destinoCodigo: (searchParams.get('destino') ?? '').toUpperCase(),
    fecha: searchParams.get('fecha') ?? '',
  }

  const [form, setForm] = useState<FilterFormState>(initialForm)

  useEffect(() => {
    fetchFlights(formToFilters(initialForm))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (patch: Partial<FilterFormState>) => setForm((prev) => ({ ...prev, ...patch }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    fetchFlights(formToFilters(form))
  }

  const handleClear = () => {
    setForm(EMPTY_FORM)
    fetchFlights(formToFilters(EMPTY_FORM))
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Vuelos</h1>

      <FiltersBar form={form} onChange={handleChange} onSubmit={handleSubmit} onClear={handleClear} />

      {isLoading && <FlightsSkeleton />}

      {!isLoading && error && (
        <FlightsError status={error.status} message={error.message} onRetry={() => fetchFlights(formToFilters(form))} />
      )}

      {!isLoading && !error && flights.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No se encontraron vuelos con esos filtros.
        </p>
      )}

      {!isLoading && !error && flights.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            itemLabel="vuelos"
            onChange={goToPage}
          />
        </>
      )}
    </section>
  )
}
