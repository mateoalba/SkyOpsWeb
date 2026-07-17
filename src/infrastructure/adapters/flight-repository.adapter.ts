// src/infrastructure/adapters/flight-repository.adapter.ts
import type { AxiosInstance } from 'axios'
import type { FlightRepository, PaginatedResult } from '@/domain/ports/flight-repository.port'
import type { Flight } from '@/domain/entities/flight.entity'
import type { FlightStatus } from '@/domain/enums/flight-status.enum'
import type { FlightFilters } from '@/application/dtos/flight-filters.dto'
import { parseApiError } from '@/infrastructure/http/parse-api-error'

/**
 * Forma cruda (snake_case) tal como la devuelve VueloSerializer.
 */
interface RawFlight {
  id: string
  numero_vuelo: string
  aerolinea: string
  aerolinea_nombre: string
  aeronave: string | null
  aeronave_matricula: string | null
  aeronave_capacidad: number | null
  origen: string
  origen_codigo: string
  origen_ciudad: string
  destino: string
  destino_codigo: string
  destino_ciudad: string
  puerta: string | null
  puerta_codigo: string | null
  salida_programada: string
  llegada_programada: string
  salida_real: string | null
  llegada_real: string | null
  estado: FlightStatus
  estado_display: string
  duracion_min: number | null
  precio_base: string | number
  asientos_primera: string
  asientos_ejecutiva: string
}

interface RawPaginatedResponse<T> {
  total: number
  paginas: number
  siguiente: string | null
  anterior: string | null
  resultados: T[]
}

function toFlight(raw: RawFlight): Flight {
  return {
    id: raw.id,
    numeroVuelo: raw.numero_vuelo,
    aerolineaId: raw.aerolinea,
    aerolineaNombre: raw.aerolinea_nombre,
    aeronaveId: raw.aeronave,
    aeronaveMatricula: raw.aeronave_matricula,
    aeronaveCapacidad: raw.aeronave_capacidad,
    origenId: raw.origen,
    origenCodigo: raw.origen_codigo,
    origenCiudad: raw.origen_ciudad,
    destinoId: raw.destino,
    destinoCodigo: raw.destino_codigo,
    destinoCiudad: raw.destino_ciudad,
    puertaId: raw.puerta,
    puertaCodigo: raw.puerta_codigo,
    salidaProgramada: raw.salida_programada,
    llegadaProgramada: raw.llegada_programada,
    salidaReal: raw.salida_real,
    llegadaReal: raw.llegada_real,
    estado: raw.estado,
    estadoDisplay: raw.estado_display,
    duracionMin: raw.duracion_min,
    precioBase: Number(raw.precio_base),
    asientosPrimera: raw.asientos_primera,
    asientosEjecutiva: raw.asientos_ejecutiva,
  }
}

function toQueryParams(filters?: FlightFilters): Record<string, string | number> {
  if (!filters) return {}
  const params: Record<string, string | number> = {}
  if (filters.estado) params.estado = filters.estado
  if (filters.origenCodigo) params.origen_codigo = filters.origenCodigo
  if (filters.destinoCodigo) params.destino_codigo = filters.destinoCodigo
  if (filters.aerolineaCodigo) params.aerolinea_codigo = filters.aerolineaCodigo
  if (filters.fecha) params.fecha = filters.fecha
  if (filters.search) params.search = filters.search
  if (filters.ordering) params.ordering = filters.ordering
  if (filters.page) params.page = filters.page
  if (filters.limite) params.limite = filters.limite
  return params
}

/**
 * Adaptador concreto del port `FlightRepository`, implementado con Axios
 * contra /api/vuelos/. Esta es la única capa que conoce la forma real
 * (snake_case, envoltorio de paginación) de la respuesta del backend.
 */
export class FlightRepositoryAxiosAdapter implements FlightRepository {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  async getFlights(filters?: FlightFilters): Promise<PaginatedResult<Flight>> {
    try {
      const { data } = await this.http.get<RawPaginatedResponse<RawFlight>>('/vuelos/', {
        params: toQueryParams(filters),
      })
      return {
        total: data.total,
        paginas: data.paginas,
        siguiente: data.siguiente,
        anterior: data.anterior,
        resultados: data.resultados.map(toFlight),
      }
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async getFlightById(id: string): Promise<Flight> {
    try {
      const { data } = await this.http.get<RawFlight>(`/vuelos/${id}/`)
      return toFlight(data)
    } catch (error) {
      throw parseApiError(error)
    }
  }
}
