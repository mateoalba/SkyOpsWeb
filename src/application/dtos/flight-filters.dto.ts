// src/application/dtos/flight-filters.dto.ts
import type { FlightStatus } from '@/domain/enums/flight-status.enum'

/**
 * Filtros de búsqueda para GET /api/vuelos/, tal como los define
 * VueloFilter (airport/filters.py) en el backend.
 */
export interface FlightFilters {
  estado?: FlightStatus
  origenCodigo?: string
  destinoCodigo?: string
  aerolineaCodigo?: string
  fecha?: string
  search?: string
  ordering?: string
  page?: number
  limite?: number
}
