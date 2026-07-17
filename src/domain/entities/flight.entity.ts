// src/domain/entities/flight.entity.ts
import type { FlightStatus } from '@/domain/enums/flight-status.enum'

/**
 * Entidad pura del dominio: representa un Vuelo.
 * Refleja los campos expuestos por VueloSerializer (airport/serializers/vuelo.py)
 * del backend, ya normalizados a camelCase. Sin dependencias externas.
 */
export interface Flight {
  id: string
  numeroVuelo: string

  aerolineaId: string
  aerolineaNombre: string

  aeronaveId: string | null
  aeronaveMatricula: string | null
  aeronaveCapacidad: number | null

  origenId: string
  origenCodigo: string
  origenCiudad: string

  destinoId: string
  destinoCodigo: string
  destinoCiudad: string

  puertaId: string | null
  puertaCodigo: string | null

  salidaProgramada: string
  llegadaProgramada: string
  salidaReal: string | null
  llegadaReal: string | null

  estado: FlightStatus
  estadoDisplay: string

  duracionMin: number | null
  precioBase: number

  asientosPrimera: string
  asientosEjecutiva: string
}
