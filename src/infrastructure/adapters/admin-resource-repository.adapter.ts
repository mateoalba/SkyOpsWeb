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
 * Si algún valor del payload es un File (p. ej. un campo de imagen que el
 * admin subió desde su ordenador en cualquiera de los formularios admin),
 * hay que mandar todo como multipart/form-data en vez de JSON — DRF no
 * acepta archivos dentro de un body JSON. `null`/`undefined` se omiten
 * (equivale a "no tocar este campo"); el resto se manda como string.
 */
function hasFile(payload: AdminRecord): boolean {
  return Object.values(payload).some((value) => value instanceof File)
}

function toFormData(payload: AdminRecord): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue
    if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }
  return formData
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
      const body = hasFile(payload) ? toFormData(payload) : payload
      const { data } = await this.http.post<AdminRecord>(endpoint, body)
      return data
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async update(endpoint: string, id: string, payload: AdminRecord): Promise<AdminRecord> {
    try {
      const body = hasFile(payload) ? toFormData(payload) : payload
      const { data } = await this.http.patch<AdminRecord>(`${endpoint}${id}/`, body)
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
