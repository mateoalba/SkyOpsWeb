// src/infrastructure/adapters/airport-repository.adapter.ts
import type { AxiosInstance } from 'axios'
import type { AirportRepository } from '@/domain/ports/airport-repository.port'
import type { Airport } from '@/domain/entities/airport.entity'
import { parseApiError } from '@/infrastructure/http/parse-api-error'

interface RawAirport {
  id: string
  nombre: string
  codigo_iata: string
  ciudad: string
  pais: string
  foto_resuelta: string | null
}

interface RawPaginatedResponse<T> {
  total: number
  paginas: number
  siguiente: string | null
  anterior: string | null
  resultados: T[]
}

function toAirport(raw: RawAirport): Airport {
  return {
    id: raw.id,
    nombre: raw.nombre,
    codigoIata: raw.codigo_iata,
    ciudad: raw.ciudad,
    pais: raw.pais,
    fotoUrl: raw.foto_resuelta || null,
  }
}

/**
 * Adaptador concreto del port `AirportRepository`, implementado con Axios
 * contra /api/aeropuertos/. Pide el máximo permitido por página (100) para
 * traer todo el catálogo real en una sola llamada — en este proyecto son
 * pocos aeropuertos sembrados/administrados, no miles.
 */
export class AirportRepositoryAxiosAdapter implements AirportRepository {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  async listAirports(): Promise<Airport[]> {
    try {
      const { data } = await this.http.get<RawPaginatedResponse<RawAirport>>('/aeropuertos/', {
        params: { limite: 100, ordering: 'pais,ciudad' },
      })
      return data.resultados.map(toAirport)
    } catch (error) {
      throw parseApiError(error)
    }
  }
}
