// src/presentation/components/flight-search-bar.tsx
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { PlaneTakeoff, PlaneLanding, ArrowLeftRight, CalendarDays } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import { FlightCalendarPopover } from '@/presentation/components/flight-calendar-popover'
import { listAirportsUseCase } from '@/infrastructure/factories/airport.factory'
import type { Airport } from '@/domain/entities/airport.entity'

type TripType = 'ida-vuelta' | 'solo-ida'

function formatShortDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(date)
}

export interface FlightSearchValues {
  origen: string
  destino: string
  fecha: string
}

interface FlightSearchBarProps {
  initialValues?: Partial<FlightSearchValues>
  onSearch: (values: FlightSearchValues) => void
  className?: string
}

/**
 * Intenta resolver un texto libre (ciudad, código o nombre) a un aeropuerto
 * real del catálogo, por coincidencia exacta primero (para que un código IATA
 * tecleado a mano siga funcionando) y si no por "empieza con". Devuelve
 * `null` si no hay ningún match, en cuyo caso se manda el texto tal cual
 * (mayúsculas) como antes, para no romper nada si el catálogo aún no cargó.
 */
function resolveAirport(query: string, airports: Airport[]): Airport | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const exact = airports.find((a) => a.codigoIata.toLowerCase() === q || a.ciudad.toLowerCase() === q)
  if (exact) return exact
  return airports.find((a) => a.ciudad.toLowerCase().startsWith(q) || a.codigoIata.toLowerCase().startsWith(q)) ?? null
}

/**
 * Campo de Origen/Destino con autocompletar contra el catálogo real de
 * aeropuertos: mientras se escribe, muestra debajo una lista de coincidencias
 * (ciudad + país + código) para elegir con el mouse — así la búsqueda no
 * depende de que el visitante escriba el código IATA exacto, y el valor que
 * de verdad se manda a buscar vuelos siempre es un código real resuelto
 * contra ese catálogo, nunca el texto suelto.
 */
function AirportField({
  icon,
  label,
  placeholder,
  query,
  airports,
  onQueryChange,
  onSelect,
}: {
  icon: React.ReactNode
  label: string
  placeholder: string
  query: string
  airports: Airport[]
  onQueryChange: (text: string) => void
  onSelect: (airport: Airport) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Solo se sugiere algo cuando el visitante ya escribió algo, y solo
  // ciudades/códigos que empiecen con eso (no "contiene en cualquier
  // parte") — así no se le tira todo el catálogo encima apenas hace foco.
  const q = query.trim().toLowerCase()
  const suggestions = q
    ? airports
        .filter((a) => a.ciudad.toLowerCase().startsWith(q) || a.codigoIata.toLowerCase().startsWith(q))
        .slice(0, 8)
    : []

  return (
    <div ref={containerRef} className="relative flex flex-1 items-center gap-3 px-4 py-3">
      {icon}
      <div className="flex-1 text-left">
        <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">{label}</label>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent text-lg font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-neutral-900 shadow-2xl">
          {suggestions.map((airport) => (
            <button
              key={airport.codigoIata}
              type="button"
              onClick={() => {
                onSelect(airport)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-lg text-white transition-colors hover:bg-white/10"
            >
              <span>
                {airport.ciudad}
                <span className="ml-1.5 text-sm font-normal text-white/50">· {airport.pais}</span>
              </span>
              <span className="text-sm text-white/50">{airport.codigoIata}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Barra de búsqueda de vuelos: toggle "Ida y vuelta / Solo ida", cápsula de
 * Origen/Destino con botón de intercambio superpuesto, y cápsula de
 * Salida/Regreso que abre el calendario de dos meses con precios por color.
 * Es la misma que usa el Home (que al buscar navega a /flights con los
 * filtros en la URL) y la propia pantalla de Vuelos (que aplica los
 * filtros directo sobre el listado sin cambiar de página) — vive en un solo
 * componente para que ambas pantallas se vean y funcionen igual.
 *
 * Origen y Destino ya no son campos de texto sueltos: se resuelven contra el
 * catálogo real de aeropuertos (con autocompletar) para que el código que se
 * manda a buscar vuelos sea siempre un código IATA real, aunque el visitante
 * escriba el nombre de la ciudad — antes "Quito" se mandaba tal cual como
 * "QUITO" y nunca encontraba el vuelo real (código real: UIO).
 */
export function FlightSearchBar({ initialValues, onSearch, className }: FlightSearchBarProps) {
  const [tripType, setTripType] = useState<TripType>('solo-ida')
  const [airports, setAirports] = useState<Airport[]>([])
  const [origenQuery, setOrigenQuery] = useState(initialValues?.origen ?? '')
  const [destinoQuery, setDestinoQuery] = useState(initialValues?.destino ?? '')
  const [salida, setSalida] = useState(initialValues?.fecha ?? '')
  const [regreso, setRegreso] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  useEffect(() => {
    listAirportsUseCase.execute().then(setAirports).catch(() => setAirports([]))
  }, [])

  // Si quien nos usa (p. ej. el botón "Limpiar" de /flights, o un link con
  // ?origen=UIO) cambia los valores desde afuera, reflejamos ese reset en los
  // campos — mostrando la ciudad si el código coincide con el catálogo ya
  // cargado, o el texto tal cual si todavía no.
  useEffect(() => {
    const rawOrigen = initialValues?.origen ?? ''
    const rawDestino = initialValues?.destino ?? ''
    setOrigenQuery(airports.find((a) => a.codigoIata === rawOrigen)?.ciudad ?? rawOrigen)
    setDestinoQuery(airports.find((a) => a.codigoIata === rawDestino)?.ciudad ?? rawDestino)
    setSalida(initialValues?.fecha ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.origen, initialValues?.destino, initialValues?.fecha, airports])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const origenAirport = resolveAirport(origenQuery, airports)
    const destinoAirport = resolveAirport(destinoQuery, airports)
    onSearch({
      origen: origenAirport?.codigoIata ?? origenQuery.trim().toUpperCase(),
      destino: destinoAirport?.codigoIata ?? destinoQuery.trim().toUpperCase(),
      fecha: salida,
    })
  }

  const handleSwap = () => {
    setOrigenQuery(destinoQuery)
    setDestinoQuery(origenQuery)
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`relative w-full rounded-2xl border border-white/10 bg-neutral-900 p-4 shadow-2xl sm:p-6 ${className ?? ''}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full bg-white/10 p-1.5">
          <button
            type="button"
            onClick={() => setTripType('ida-vuelta')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:text-base ${
              tripType === 'ida-vuelta' ? 'bg-white text-neutral-900' : 'text-white/70 hover:text-white'
            }`}
          >
            Ida y vuelta
          </button>
          <button
            type="button"
            onClick={() => setTripType('solo-ida')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:text-base ${
              tripType === 'solo-ida' ? 'bg-white text-neutral-900' : 'text-white/70 hover:text-white'
            }`}
          >
            Solo ida
          </button>
        </div>
        <p className="text-sm text-white/50">Consulta la disponibilidad real de nuestra flota</p>
      </div>

      <div className="flex flex-1 flex-col items-stretch gap-4 lg:flex-row">
        {/* Origen / Destino combinados en una sola cápsula, con el botón
            de intercambio superpuesto sobre el divisor central. */}
        <div className="relative flex flex-1 flex-col overflow-visible rounded-xl border border-white/25 bg-white/[0.07] sm:flex-row lg:h-16">
          <AirportField
            icon={<PlaneTakeoff className="h-6 w-6 shrink-0 text-primary" />}
            label="Origen"
            placeholder="Ciudad o código"
            query={origenQuery}
            airports={airports}
            onQueryChange={setOrigenQuery}
            onSelect={(airport) => setOrigenQuery(airport.ciudad)}
          />

          <div className="hidden w-px bg-white/25 sm:block" />
          <div className="block h-px w-full bg-white/25 sm:hidden" />

          <button
            type="button"
            onClick={handleSwap}
            aria-label="Intercambiar origen y destino"
            className="absolute left-1/2 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-neutral-900 text-white/80 transition-colors hover:text-primary"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <AirportField
            icon={<PlaneLanding className="h-6 w-6 shrink-0 text-primary" />}
            label="Destino"
            placeholder="Ciudad o código"
            query={destinoQuery}
            airports={airports}
            onQueryChange={setDestinoQuery}
            onSelect={(airport) => setDestinoQuery(airport.ciudad)}
          />
        </div>

        {/* Salida / Regreso combinados en la misma cápsula; ambos botones
            abren el mismo calendario de dos meses. */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/25 bg-white/[0.07] sm:flex-row lg:h-16 lg:w-auto">
          <button
            type="button"
            onClick={() => setDatePickerOpen(true)}
            className="flex flex-1 items-center gap-3 px-4 py-3 text-left lg:min-w-[180px]"
          >
            <CalendarDays className="h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <span className="block text-sm font-semibold uppercase tracking-wide text-white/60">Salida</span>
              <span className={`block text-lg font-medium ${salida ? 'text-white' : 'text-white/50'}`}>
                {salida ? formatShortDate(salida) : 'dd/mm/aaaa'}
              </span>
            </div>
          </button>

          {tripType === 'ida-vuelta' && (
            <>
              <div className="hidden w-px bg-white/25 sm:block" />
              <div className="block h-px w-full bg-white/25 sm:hidden" />
              <button
                type="button"
                onClick={() => setDatePickerOpen(true)}
                className="flex flex-1 items-center gap-3 px-4 py-3 text-left lg:min-w-[180px]"
              >
                <CalendarDays className="h-6 w-6 shrink-0 text-primary" />
                <div className="flex-1">
                  <span className="block text-sm font-semibold uppercase tracking-wide text-white/60">Regreso</span>
                  <span className={`block text-lg font-medium ${regreso ? 'text-white' : 'text-white/50'}`}>
                    {regreso ? formatShortDate(regreso) : 'dd/mm/aaaa'}
                  </span>
                </div>
              </button>
            </>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-auto w-full rounded-xl py-3 text-2xl font-bold text-white lg:h-16 lg:w-auto lg:px-12 lg:text-3xl"
        >
          Buscar
        </Button>
      </div>

      {datePickerOpen && (
        <FlightCalendarPopover
          tripType={tripType}
          salida={salida}
          regreso={regreso}
          onChangeSalida={setSalida}
          onChangeRegreso={setRegreso}
          onClose={() => setDatePickerOpen(false)}
          origenCodigo={resolveAirport(origenQuery, airports)?.codigoIata ?? (origenQuery.trim() || undefined)}
          destinoCodigo={resolveAirport(destinoQuery, airports)?.codigoIata ?? (destinoQuery.trim() || undefined)}
        />
      )}
    </form>
  )
}
