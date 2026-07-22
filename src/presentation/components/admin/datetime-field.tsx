// src/presentation/components/admin/datetime-field.tsx
import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/presentation/utils/cn'

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

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

function formatLabel(value: string): string {
  if (!value) return ''
  const [datePart, timePart] = value.split('T')
  if (!datePart) return ''
  const [y, m, d] = datePart.split('-').map(Number)
  if (!y || !m || !d) return ''
  const date = new Date(y, m - 1, d)
  const dateLabel = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
  return timePart ? `${dateLabel}, ${timePart}` : dateLabel
}

interface AdminDateTimeFieldProps {
  /** Valor combinado "YYYY-MM-DDTHH:mm" (mismo formato que antes usaba el
   * <input type="datetime-local"> nativo), o '' si no hay nada elegido. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Selector de fecha y hora para los formularios admin (Salida/Llegada
 * programada de un Vuelo, etc.): reemplaza el `<input type="datetime-local">`
 * nativo, cuya interfaz varía por navegador y en Chrome se ve como un
 * calendario chico con una lista de horas aparte, poco prolijo — por el
 * mismo estilo de calendario de dos meses que ya usa el buscador público de
 * vuelos (ver flight-calendar-popover.tsx), con un campo de hora aparte
 * debajo. A diferencia del buscador público, acá SÍ se pueden elegir fechas
 * pasadas (un admin puede estar cargando o corrigiendo un vuelo histórico).
 */
export function AdminDateTimeField({ value, onChange, placeholder }: AdminDateTimeFieldProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [datePart, timePart] = value ? value.split('T') : ['', '']
  const today = new Date()
  const [baseMonth, setBaseMonth] = useState(() => {
    if (datePart) {
      const [y, m] = datePart.split('-').map(Number)
      if (y && m) return new Date(y, m - 1, 1)
    }
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

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

  const handleSelectDay = (iso: string) => {
    onChange(`${iso}T${timePart || '00:00'}`)
  }

  const handleTimeChange = (time: string) => {
    if (!datePart) return
    onChange(`${datePart}T${time}`)
  }

  const monthA = baseMonth
  const monthB = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1)

  const renderMonth = (month: Date) => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const cells = buildMonthGrid(year, monthIndex)

    return (
      <div className="flex-1">
        <p className="mb-3 text-center text-sm font-bold">
          {MONTH_NAMES[monthIndex]} {year}
        </p>
        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((wd) => (
            <span key={wd} className="text-[11px] font-semibold text-muted-foreground">
              {wd}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />
            const isSelected = cell.iso === datePart
            const isToday = cell.iso === toISODate(today)
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => handleSelectDay(cell.iso)}
                className={cn(
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                  isToday && !isSelected && 'ring-1 ring-primary/50',
                )}
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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-left text-base shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={value ? '' : 'text-muted-foreground'}>
          {value ? formatLabel(value) : (placeholder ?? 'dd/mm/aaaa --:--')}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border bg-popover p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setBaseMonth(new Date(monthA.getFullYear(), monthA.getMonth() - 1, 1))}
              aria-label="Mes anterior"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-muted-foreground">Selecciona fecha y hora</p>
            <button
              type="button"
              onClick={() => setBaseMonth(new Date(monthA.getFullYear(), monthA.getMonth() + 1, 1))}
              aria-label="Mes siguiente"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {renderMonth(monthA)}
            {renderMonth(monthB)}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              Hora
              <input
                type="time"
                value={timePart || ''}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={!datePart}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={!datePart}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
