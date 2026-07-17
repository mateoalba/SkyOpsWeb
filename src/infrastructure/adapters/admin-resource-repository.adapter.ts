// src/infrastructure/adapters/admin-resource-repository.adapter.ts
import type { AxiosInstance } from 'axios'
import type {
  AdminResourceRepository,
  AdminListParams,
  AdminPaginatedResult,
  AdminRecord,
} from '@/domain/ports/admin-resource-repository.port'
import { parseApiError } from '@/infrastructure/http/parse-api-error'

interface RawPaginatedResponse {
  total: number
  paginas: number
  siguiente: string | null
  anterior: string | null
  resultados: AdminRecord[]
}

/**
 * Adaptador genérico: cualquiera de los 25 endpoints admin sigue el mismo
 * patrón REST de DRF (list/create/update/destroy), así que un solo
 * adapter le sirve a todos.
 */
export class AdminResourceRepositoryAxiosAdapter implements AdminResourceRepository {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  async list(endpoint: string, params?: AdminListParams): Promise<AdminPaginatedResult> {
    try {
      const { data } = await this.http.get<RawPaginatedResponse>(endpoint, {
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.page ? { page: params.page } : {}),
          ...(params?.limite ? { limite: params.limite } : {}),
          ...(params?.ordering ? { ordering: params.ordering } : {}),
        },
      })
      return data
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async create(endpoint: string, payload: AdminRecord): Promise<AdminRecord> {
    try {
      const { data } = await this.http.post<AdminRecord>(endpoint, payload)
      return data
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async update(endpoint: string, id: string, payload: AdminRecord): Promise<AdminRecord> {
    try {
      const { data } = await this.http.patch<AdminRecord>(`${endpoint}${id}/`, payload)
      return data
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async remove(endpoint: string, id: string): Promise<void> {
    try {
      await this.http.delete(`${endpoint}${id}/`)
    } catch (error) {
      throw parseApiError(error)
    }
  }
}
