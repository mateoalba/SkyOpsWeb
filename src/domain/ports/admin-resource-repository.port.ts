// src/domain/ports/admin-resource-repository.port.ts

/**
 * Fila cruda de cualquier recurso administrativo. A diferencia de Vuelo o
 * AuthUser, acá no tipamos cada una de las 25 tablas del backend: el
 * dashboard admin las recorre / edita de forma genérica.
 */
export type AdminRecord = Record<string, unknown>

export interface AdminListParams {
  search?: string
  page?: number
  limite?: number
  ordering?: string
}

export interface AdminPaginatedResult {
  total: number
  paginas: number
  siguiente: string | null
  anterior: string | null
  resultados: AdminRecord[]
}

/**
 * Puerto genérico para listar/crear/editar/eliminar cualquiera de los 25
 * recursos administrativos (todos comparten el mismo envoltorio de
 * paginación PaginacionEstandar y el mismo patrón REST de DRF).
 */
export interface AdminResourceRepository {
  list(endpoint: string, params?: AdminListParams): Promise<AdminPaginatedResult>
  create(endpoint: string, payload: AdminRecord): Promise<AdminRecord>
  update(endpoint: string, id: string, payload: AdminRecord): Promise<AdminRecord>
  remove(endpoint: string, id: string): Promise<void>
}
