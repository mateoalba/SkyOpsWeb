// src/application/use-cases/get-flight-by-id.use-case.ts
import type { FlightRepository } from '@/domain/ports/flight-repository.port'
import type { Flight } from '@/domain/entities/flight.entity'

/**
 * Caso de uso: obtener el detalle de un vuelo por id.
 */
export class GetFlightByIdUseCase {
  private readonly flightRepository: FlightRepository

  constructor(flightRepository: FlightRepository) {
    this.flightRepository = flightRepository
  }

  execute(id: string): Promise<Flight> {
    return this.flightRepository.getFlightById(id)
  }
}
