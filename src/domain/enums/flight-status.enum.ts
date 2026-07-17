// src/domain/enums/flight-status.enum.ts

/**
 * Estados posibles de un vuelo, tal como los define el backend
 * (Vuelo.Estado en airport/models/vuelo.py).
 */
export type FlightStatus =
  | 'programado'
  | 'embarcando'
  | 'despegado'
  | 'aterrizado'
  | 'cancelado'
  | 'retrasado'

export const FLIGHT_STATUS_LABELS: Record<FlightStatus, string> = {
  programado: 'Programado',
  embarcando: 'Embarcando',
  despegado: 'Despegado',
  aterrizado: 'Aterrizado',
  cancelado: 'Cancelado',
  retrasado: 'Retrasado',
}
