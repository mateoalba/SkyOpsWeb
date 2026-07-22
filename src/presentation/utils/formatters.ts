// src/presentation/utils/formatters.ts

/**
 * Formatea una fecha/hora ISO de un vuelo a formato legible.
 * Ejemplo: "2026-07-15T14:30:00Z" → "Jul 15, 2026, 2:30 PM"
 */
export function formatFlightDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

/**
 * Formatea una fecha/hora ISO a solo la hora.
 * Ejemplo: "2026-07-15T08:15:00Z" → "8:15 AM"
 */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

/**
 * Formatea una fecha ISO a formato legible (sin hora).
 * Ejemplo: "2026-07-15" → "Jul 15, 2026"
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

/**
 * Formatea la duración de un vuelo en minutos a "Xh Ym".
 * Ejemplo: 135 → "2h 15m"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

/**
 * Formatea un precio en dólares (USD, moneda de Ecuador).
 * Ejemplo: 129.9 → "$129.90"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
