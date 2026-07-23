// src/presentation/components/auth/birthdate-picker.tsx
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/presentation/utils/cn'
import { Popover, PopoverTrigger, PopoverContent } from '@/presentation/components/ui/popover'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
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

function parseISODate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

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

interface BirthdatePickerProps {
  value: string
  onChange: (iso: string) => void
  className?: string
  id?: string
}

/**
 * Selector de fecha propio (con el mismo estilo de vidrio de la tarjeta) para
 * reemplazar el <input type="date">: el calendario nativo del navegador es UI
 * del sistema operativo y no se puede restylear con CSS/Tailwind.
 *
 * Usa Radix Popover (portal a document.body) en vez de un div absoluto
 * casero: así el calendario no queda recortado por el `overflow-hidden` del
 * fondo de la página de registro, y el ancho se fija al del propio trigger
 * vía la variable --radix-popover-trigger-width (mismo mecanismo que ya usa
 * SelectContent en este proyecto).
 */
export function BirthdatePicker({ value, onChange, className, id }: BirthdatePickerProps) {
  const [open, setOpen] = useState(false)
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), [])
  const selected = useMemo(() => parseISODate(value), [value])
  const [viewDate, setViewDate] = useState(() => selected ?? new Date(today.getFullYear() - 20, today.getMonth(), 1))

  useEffect(() => {
    if (selected) setViewDate(selected)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const cells = buildMonthGrid(year, month)
  const years = useMemo(() => {
    const currentYear = today.getFullYear()
    return Array.from({ length: 100 }, (_, i) => currentYear - i)
  }, [today])

  const label = selected
    ? `${selected.getDate()} de ${MONTH_NAMES[selected.getMonth()].toLowerCase()} de ${selected.getFullYear()}`
    : 'dd/mm/aaaa'

  const handleSelectDay = (iso: string) => {
    onChange(iso)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-full border border-black/10 bg-black/5 px-4 text-sm shadow-sm backdrop-blur-sm transition-colors focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/15 dark:bg-white/5',
            !selected && 'text-muted-foreground/70',
            className,
          )}
        >
          {label}
          <CalendarDays className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        className="rounded-2xl border border-white/30 bg-card/90 backdrop-blur-2xl dark:border-white/10"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            aria-label="Mes anterior"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-foreground/70 hover:text-foreground dark:border-white/15"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-1 gap-1.5">
            <select
              value={month}
              onChange={(e) => setViewDate(new Date(year, Number(e.target.value), 1))}
              className="w-1/2 rounded-full border border-black/10 bg-black/5 px-2 py-1 text-xs font-medium dark:border-white/15 dark:bg-white/5"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i} className="text-foreground bg-card">
                  {name}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setViewDate(new Date(Number(e.target.value), month, 1))}
              className="w-1/2 rounded-full border border-black/10 bg-black/5 px-2 py-1 text-xs font-medium dark:border-white/15 dark:bg-white/5"
            >
              {years.map((y) => (
                <option key={y} value={y} className="text-foreground bg-card">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            aria-label="Mes siguiente"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-foreground/70 hover:text-foreground dark:border-white/15"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((wd) => (
            <span key={wd} className="text-xs font-semibold text-muted-foreground">
              {wd}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />

            const isFuture = cell.date > today
            const isSelected = selected && cell.iso === toISODate(selected)
            const isToday = cell.iso === toISODate(today)

            return (
              <button
                key={cell.iso}
                type="button"
                disabled={isFuture}
                onClick={() => handleSelectDay(cell.iso)}
                className={cn(
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isFuture
                    ? 'cursor-not-allowed text-muted-foreground/30'
                    : isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-foreground/10',
                  isToday && !isSelected && 'ring-1 ring-primary/50',
                )}
              >
                {cell.date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex justify-between border-t border-foreground/10 pt-3 text-xs">
          <button
            type="button"
            onClick={() => onChange('')}
            className="font-medium text-primary hover:underline"
          >
            Borrar
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-medium text-primary hover:underline"
          >
            Cerrar
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
