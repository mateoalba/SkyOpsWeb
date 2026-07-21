// src/presentation/components/flight-search-bar.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { PlaneTakeoff, PlaneLanding, ArrowLeftRight, CalendarDays } from 'lucide-react'

import { Button } from '@/presentation/components/ui/button'
import { FlightCalendarPopover } from '@/presentation/components/flight-calendar-popover'

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
 * Barra de búsqueda de vuelos: toggle "Ida y vuelta / Solo ida", cápsula de
 * Origen/Destino con botón de intercambio superpuesto, y cápsula de
 * Salida/Regreso que abre el calendario de dos meses con precios por color.
 * Es la misma que usa el Home (que al buscar navega a /flights con los
 * filtros en la URL) y la propia pantalla de Vuelos (que aplica los
 * filtros directo sobre el listado sin cambiar de página) — vive en un solo
 * componente para que ambas pantallas se vean y funcionen igual.
 */
export function FlightSearchBar({ initialValues, onSearch, className }: FlightSearchBarProps) {
  const [tripType, setTripType] = useState<TripType>('solo-ida')
  const [origen, setOrigen] = useState(initialValues?.origen ?? '')
  const [destino, setDestino] = useState(initialValues?.destino ?? '')
  const [salida, setSalida] = useState(initialValues?.fecha ?? '')
  const [regreso, setRegreso] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // Si quien nos usa (p. ej. el botón "Limpiar" de /flights) cambia los
  // valores desde afuera, reflejamos ese reset en los campos — si no, esta
  // barra solo tomaba los valores iniciales una vez al montar y se quedaba
  // desincronizada del resto de los filtros de la página.
  useEffect(() => {
    setOrigen(initialValues?.origen ?? '')
    setDestino(initialValues?.destino ?? '')
    setSalida(initialValues?.fecha ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.origen, initialValues?.destino, initialValues?.fecha])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    onSearch({
      origen: origen.trim().toUpperCase(),
      destino: destino.trim().toUpperCase(),
      fecha: salida,
    })
  }

  const handleSwap = () => {
    setOrigen(destino)
    setDestino(origen)
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
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-white/25 bg-white/[0.07] sm:flex-row lg:h-16">
          <div className="flex flex-1 items-center gap-3 px-4 py-3">
            <PlaneTakeoff className="h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1 text-left">
              <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Origen</label>
              <input
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Ciudad o código"
                className="w-full bg-transparent text-lg font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
              />
            </div>
          </div>

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

          <div className="flex flex-1 items-center gap-3 px-4 py-3">
            <PlaneLanding className="h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1 text-left">
              <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Destino</label>
              <input
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ciudad o código"
                className="w-full bg-transparent text-lg font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
              />
            </div>
          </div>
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
          origenCodigo={origen.trim() ? origen.trim().toUpperCase() : undefined}
          destinoCodigo={destino.trim() ? destino.trim().toUpperCase() : undefined}
        />
      )}
    </form>
  )
}
