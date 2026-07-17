// src/presentation/utils/flight-status-variant.ts
import type { FlightStatus } from '@/domain/enums/flight-status.enum'

/**
 * Mapea cada estado de vuelo a una variante visual de <Badge>.
 * Es una decisión puramente de presentación (colores), por eso vive acá
 * y no en domain/enums.
 */
export const FLIGHT_STATUS_VARIANT: Record<
  FlightStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  programado: 'secondary',
  embarcando: 'default',
  despegado: 'default',
  aterrizado: 'outline',
  retrasado: 'destructive',
  cancelado: 'destructive',
}
