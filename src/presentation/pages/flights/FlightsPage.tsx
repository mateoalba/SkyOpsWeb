// src/presentation/pages/flights/FlightsPage.tsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'

import { FlightSearchBar, type FlightSearchValues } from '@/presentation/components/flight-search-bar'
import { DestinationOffersSection } from '@/presentation/components/destination-offers-section'
import { FlightCard } from '@/presentation/components/flight-card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Button } from '@/presentation/components/ui/button'
import { getFlightsUseCase } from '@/infrastructure/factories/flight.factory'
import { listAirportsUseCase } from '@/infrastructure/factories/airport.factory'
import type { Flight } from '@/domain/entities/flight.entity'
import type { Airport } from '@/domain/entities/airport.entity'

function formatFechaCorta(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long' }).format(date)
}

/**
 * Arma la descripción en palabras de la búsqueda actual: "de Quito a
 * Guayaquil", "desde Quito" (si solo hay origen), "hacia Guayaquil" (si solo
 * hay destino), o vacío si la búsqueda es solo por fecha (sin ruta puntual).
 */
function buildRouteLabel(origenCiudad: string | null, destinoCiudad: string | null): string {
  if (origenCiudad && destinoCiudad) return `de ${origenCiudad} a ${destinoCiudad}`
  if (origenCiudad) return `desde ${origenCiudad}`
  if (destinoCiudad) return `hacia ${destinoCiudad}`
  return ''
}

/**
 * Resultados reales de una búsqueda: origen y/o destino son ahora opcionales
 * — si el visitante solo elige una fecha (sin llenar origen ni destino), se
 * muestran los primeros vuelos disponibles ese día en toda la flota, en vez
 * de no buscar nada. A diferencia de "Ofertas desde" (que solo navega por
 * destino y precio más barato), esto sí consulta GET /vuelos/ con los
 * filtros reales y muestra los vuelos encontrados debajo de la barra de
 * búsqueda — o un estado vacío si no hay ninguno. La sección "Ofertas desde"
 * de más abajo (ver FlightsPage) nunca se oculta por esto, así que el
 * visitante siempre puede seguir explorando otros destinos.
 */
function FlightSearchResults({
  origenCodigo,
  destinoCodigo,
  fecha,
  onClear,
}: {
  origenCodigo: string
  destinoCodigo: string
  fecha: string
  onClear: () => void
}) {
  const [flights, setFlights] = useState<Flight[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [airports, setAirports] = useState<Airport[]>([])

  // Sin ruta puntual (ni origen ni destino), es una búsqueda amplia por
  // fecha sobre toda la flota — ahí sí conviene topear a los primeros 10
  // resultados en vez de traer decenas de vuelos sin relación entre sí.
  const isRouteSearch = Boolean(origenCodigo && destinoCodigo)

  useEffect(() => {
    listAirportsUseCase.execute().then(setAirports).catch(() => setAirports([]))
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setFlights(null)

    getFlightsUseCase
      .execute({
        origenCodigo: origenCodigo || undefined,
        destinoCodigo: destinoCodigo || undefined,
        fecha: fecha || undefined,
        ordering: 'salida_programada',
        limite: isRouteSearch ? 50 : 10,
      })
      .then((result) => {
        if (!active) return
        setFlights(result.resultados)
      })
      .catch(() => {
        if (!active) return
        setFlights([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [origenCodigo, destinoCodigo, fecha, isRouteSearch])

  const origenCiudad = origenCodigo ? airports.find((a) => a.codigoIata === origenCodigo)?.ciudad ?? origenCodigo : null
  const destinoCiudad = destinoCodigo
    ? airports.find((a) => a.codigoIata === destinoCodigo)?.ciudad ?? destinoCodigo
    : null
  const routeLabel = buildRouteLabel(origenCiudad, destinoCiudad)
  const fechaLabel = fecha ? formatFechaCorta(fecha) : ''

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <SearchX className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold">
            {routeLabel
              ? `Todavía no hay vuelos ${routeLabel}${fechaLabel ? ` para el ${fechaLabel}` : ''}`
              : `Todavía no hay vuelos programados para el ${fechaLabel}`}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Probá con otra fecha o mirá los destinos disponibles más abajo.
          </p>
        </div>
        <Button variant="outline" onClick={onClear} className="mt-1 rounded-full">
          Limpiar búsqueda
        </Button>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {flights.length} vuelo{flights.length === 1 ? '' : 's'} {routeLabel ? 'encontrado' : 'disponible'}
        {flights.length === 1 ? '' : 's'}
        {routeLabel ? ` ${routeLabel}` : ''}
        {fechaLabel ? ` para el ${fechaLabel}` : ''}
        {!isRouteSearch && flights.length >= 10 ? ' (mostrando los primeros 10)' : ''}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {flights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            origenFotoUrl={airports.find((a) => a.codigoIata === flight.origenCodigo)?.fotoUrl ?? null}
            destinoFotoUrl={airports.find((a) => a.codigoIata === flight.destinoCodigo)?.fotoUrl ?? null}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Pantalla de Vuelos: mismo buscador que el Home arriba. Si la búsqueda trae
 * origen y/o destino (p. ej. al hacer clic en una tarjeta de "Ofertas
 * desde"), o incluso solo una fecha sin ruta puntual, se muestra ese
 * resultado real justo debajo de la barra (ver FlightSearchResults) — pero
 * la sección "Ofertas desde [Ciudad]" de más abajo se sigue mostrando
 * siempre, con todos los demás destinos, en vez de desaparecer al buscar.
 */
export default function FlightsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const origen = searchParams.get('origen') ?? ''
  const destino = searchParams.get('destino') ?? ''
  const fecha = searchParams.get('fecha') ?? ''

  const handleSearch = ({ origen, destino, fecha }: FlightSearchValues) => {
    const params = new URLSearchParams()
    if (origen) params.set('origen', origen)
    if (destino) params.set('destino', destino)
    if (fecha) params.set('fecha', fecha)
    setSearchParams(params)
  }

  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <FlightSearchBar
          className="mb-10"
          initialValues={{ origen, destino, fecha }}
          onSearch={handleSearch}
        />

        {(origen || destino || fecha) && (
          <div className="mb-12">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">Resultado de tu búsqueda</h2>
            <FlightSearchResults
              origenCodigo={origen}
              destinoCodigo={destino}
              fecha={fecha}
              onClear={() => setSearchParams({})}
            />
          </div>
        )}

        <DestinationOffersSection extraLimit={8} paginated initialOrigenCodigo={origen || null} />
      </div>
    </section>
  )
}
