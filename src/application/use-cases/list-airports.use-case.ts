// src/application/use-cases/list-airports.use-case.ts
import type { AirportRepository } from '@/domain/ports/airport-repository.port'
import type { Airport } from '@/domain/entities/airport.entity'

export class ListAirportsUseCase {
  private readonly airportRepository: AirportRepository

  constructor(airportRepository: AirportRepository) {
    this.airportRepository = airportRepository
  }

  execute(): Promise<Airport[]> {
    return this.airportRepository.listAirports()
  }
}
