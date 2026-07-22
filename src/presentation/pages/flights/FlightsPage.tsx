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

/**
 * Resultados reales de una búsqueda con origen + destino (y opcionalmente
 * fecha): a diferencia de "Ofertas desde" (que solo navega por destino y
 * precio más barato), esto sí consulta GET /vuelos/ con esa ruta exacta y
 * muestra los vuelos reales encontrados debajo de la barra de búsqueda — o
 * un estado vacío si no hay ninguno programado todavía para esa ruta. La
 * sección "Ofertas desde" de más abajo (ver FlightsPage) nunca se oculta por
 * esto, así que el visitante siempre puede seguir explorando otros destinos.
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

  useEffect(() => {
    listAirportsUseCase.execute().then(setAirports).catch(() => setAirports([]))
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setFlights(null)

    getFlightsUseCase
      .execute({
        origenCodigo,
        destinoCodigo,
        fecha: fecha || undefined,
        ordering: 'salida_programada',
        limite: 50,
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
  }, [origenCodigo, destinoCodigo, fecha])

  const origenCiudad = airports.find((a) => a.codigoIata === origenCodigo)?.ciudad ?? origenCodigo
  const destinoCiudad = airports.find((a) => a.codigoIata === destinoCodigo)?.ciudad ?? destinoCodigo

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
            Todavía no hay vuelos de {origenCiudad} a {destinoCiudad}
            {fecha ? ' en esa fecha' : ''}
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
        {flights.length} vuelo{flights.length === 1 ? '' : 's'} encontrado{flights.length === 1 ? '' : 's'} de{' '}
        {origenCiudad} a {destinoCiudad}
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
 * origen Y destino (p. ej. al hacer clic en una tarjeta de "Ofertas desde"),
 * se muestra ese resultado real justo debajo de la barra (ver
 * FlightSearchResults) — pero la sección "Ofertas desde [Ciudad]" de más
 * abajo se sigue mostrando siempre, con todos los demás destinos, en vez de
 * desaparecer al buscar una ruta puntual.
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

        {origen && destino && (
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

        <DestinationOffersSection extraLimit={Infinity} initialOrigenCodigo={origen || null} />
      </div>
    </section>
  )
}
