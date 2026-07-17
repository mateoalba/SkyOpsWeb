// src/domain/ports/flight-repository.port.ts
import type { Flight } from '@/domain/entities/flight.entity'
import type { FlightFilters } from '@/application/dtos/flight-filters.dto'

/**
 * Respuesta paginada tal como la envuelve PaginacionEstandar
 * (airport/pagination.py) en el backend: { total, paginas, siguiente,
 * anterior, resultados }.
 */
export interface PaginatedResult<T> {
  total: number
  paginas: number
  siguiente: string | null
  anterior: string | null
  resultados: T[]
}

/**
 * Puerto (contrato) del repositorio de vuelos. La capa infrastructure
 * implementa esta interfaz (con Axios); application solo conoce el contrato.
 */
export interface FlightRepository {
  getFlights(filters?: FlightFilters): Promise<PaginatedResult<Flight>>
  getFlightById(id: string): Promise<Flight>
}
