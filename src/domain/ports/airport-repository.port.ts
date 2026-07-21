// src/domain/ports/airport-repository.port.ts
import type { Airport } from '@/domain/entities/airport.entity'

/**
 * Puerto (contrato) de aeropuertos. GET /api/aeropuertos/ es de solo
 * lectura pública (permiso `SoloLectura` en el backend), así que el Home
 * puede listarlos sin estar autenticado.
 */
export interface AirportRepository {
  listAirports(): Promise<Airport[]>
}
