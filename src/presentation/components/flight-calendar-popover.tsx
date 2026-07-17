// src/presentation/components/flight-calendar-popover.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { getFlightsUseCase } from '@/infrastructure/factories/flight.factory'
import type { Flight } from '@/domain/entities/flight.entity'

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

type TripType = 'ida-vuelta' | 'solo-ida'
type PriceTier = 'low' | 'mid' | 'high'

interface DayCell {
  date: Date
  iso: string
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Grilla de un mes, con celdas vacías al inicio para que la semana empiece en lunes. */
function buildMonthGrid(year: number, month: number): (DayCell | null)[] {
  const first = new Date(year, month, 1)
  const leading = (first.getDay() + 6) % 7 // 0 = lunes
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (DayCell | null)[] = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    cells.push({ date, iso: toISODate(date) })
  }
  return cells
}

interface FlightCalendarPopoverProps {
  tripType: TripType
  salida: string
  regreso: string
  onChangeSalida: (value: string) => void
  onChangeRegreso: (value: string) => void
  onClose: () => void
  origenCodigo?: string
  destinoCodigo?: string
}

/**
 * Calendario de dos meses (estilo "¿Cuándo quieres volar?" de los buscadores
 * de aerolíneas comerciales), con leyenda de precio por color. Los colores
 * solo se calculan a partir de vuelos reales de la ruta seleccionada
 * (agrupando por fecha y tomando el precio más bajo del día, repartido en
 * terciles) — si todavía no hay origen y destino, el calendario funciona
 * igual mostrando solo el número de día, sin inventar precios.
 */
export function FlightCalendarPopover({
  tripType,
  salida,
  regreso,
  onChangeSalida,
  onChangeRegreso,
  onClose,
  origenCodigo,
  destinoCodigo,
}: FlightCalendarPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const today = useMemo(() => startOfDay(new Date()), [])
  const [baseMonth, setBaseMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [dayPrices, setDayPrices] = useState<Record<string, PriceTier>>({})

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  useEffect(() => {
    if (!origenCodigo || !destinoCodigo) {
      setDayPrices({})
      return
    }
    let active = true
    getFlightsUseCase
      .execute({ origenCodigo, destinoCodigo, ordering: 'salida_programada', limite: 200 })
      .then((result) => {
        if (!active) return
        const cheapestByDay = new Map<string, number>()
        for (const flight of result.resultados as Flight[]) {
          const iso = flight.salidaProgramada.slice(0, 10)
          const existing = cheapestByDay.get(iso)
          if (existing === undefined || flight.precioBase < existing) {
            cheapestByDay.set(iso, flight.precioBase)
          }
        }
        if (cheapestByDay.size === 0) {
          setDayPrices({})
          return
        }
        const prices = Array.from(cheapestByDay.values())
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const span = max - min || 1
        const tiers: Record<string, PriceTier> = {}
        cheapestByDay.forEach((price, iso) => {
          const ratio = (price - min) / span
          tiers[iso] = ratio < 1 / 3 ? 'low' : ratio < 2 / 3 ? 'mid' : 'high'
        })
        setDayPrices(tiers)
      })
      .catch(() => setDayPrices({}))
    return () => {
      active = false
    }
  }, [origenCodigo, destinoCodigo, baseMonth])

  const monthA = baseMonth
  const monthB = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1)

  const handleSelectDay = (iso: string) => {
    if (tripType === 'solo-ida') {
      onChangeSalida(iso)
      onClose()
      return
    }
    // Ida y vuelta: primer click define salida, segundo define regreso.
    if (!salida || (salida && regreso) || iso < salida) {
      onChangeSalida(iso)
      onChangeRegreso('')
    } else {
      onChangeRegreso(iso)
      onClose()
    }
  }

  const renderMonth = (month: Date) => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const cells = buildMonthGrid(year, monthIndex)

    return (
      <div className="flex-1">
        <p className="mb-4 text-center text-base font-bold text-white">
          {MONTH_NAMES[monthIndex]} {year}
        </p>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((wd) => (
            <span key={wd} className="text-xs font-semibold text-white/50">
              {wd}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />

            const isPast = cell.date < today
            const isToday = cell.iso === toISODate(today)
            const isSalida = cell.iso === salida
            const isRegreso = cell.iso === regreso
            const isInRange =
              tripType === 'ida-vuelta' && salida && regreso && cell.iso > salida && cell.iso < regreso
            const isSelected = isSalida || isRegreso
            const tier = dayPrices[cell.iso]

            const tierClass =
              tier === 'low'
                ? 'bg-emerald-700/70 text-white'
                : tier === 'mid'
                  ? 'bg-yellow-700/70 text-white'
                  : tier === 'high'
                    ? 'bg-red-800/70 text-white'
                    : 'text-white/85 hover:bg-white/10'

            return (
              <button
                key={cell.iso}
                type="button"
                disabled={isPast}
                onClick={() => handleSelectDay(cell.iso)}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isPast
                    ? 'cursor-not-allowed text-white/20'
                    : isSelected
                      ? 'bg-primary text-white'
                      : isInRange
                        ? 'bg-primary/20 text-white'
                        : tierClass
                } ${isToday && !isSelected ? 'ring-1 ring-white/50' : ''}`}
              >
                {cell.date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-full z-50 mt-2 w-full rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-bold text-white">¿Cuándo quieres volar?</p>
        <div className="flex items-center gap-4 text-xs text-white/70">
          <span>Encuentra el mejor precio</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />$
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-700" />$$
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-800" />$$$
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2 sm:gap-6">
        <button
          type="button"
          onClick={() => setBaseMonth(new Date(monthA.getFullYear(), monthA.getMonth() - 1, 1))}
          aria-label="Mes anterior"
          className="mt-8 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-2">
          {renderMonth(monthA)}
          {renderMonth(monthB)}
        </div>

        <button
          type="button"
          onClick={() => setBaseMonth(new Date(monthA.getFullYear(), monthA.getMonth() + 1, 1))}
          aria-label="Mes siguiente"
          className="mt-8 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
