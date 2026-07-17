// src/application/use-cases/get-flights.use-case.ts
import type { FlightRepository, PaginatedResult } from '@/domain/ports/flight-repository.port'
import type { Flight } from '@/domain/entities/flight.entity'
import type { FlightFilters } from '@/application/dtos/flight-filters.dto'

/**
 * Caso de uso: obtener el listado (paginado) de vuelos.
 * Orquesta el port `FlightRepository`; no conoce Axios ni ningún detalle
 * de infraestructura.
 */
export class GetFlightsUseCase {
  private readonly flightRepository: FlightRepository

  constructor(flightRepository: FlightRepository) {
    this.flightRepository = flightRepository
  }

  execute(filters?: FlightFilters): Promise<PaginatedResult<Flight>> {
    return this.flightRepository.getFlights(filters)
  }
}
