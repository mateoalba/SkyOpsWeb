// src/application/use-cases/get-admin-resource-list.use-case.ts
import type {
  AdminResourceRepository,
  AdminListParams,
  AdminPaginatedResult,
} from '@/domain/ports/admin-resource-repository.port'

export class GetAdminResourceListUseCase {
  private readonly repository: AdminResourceRepository

  constructor(repository: AdminResourceRepository) {
    this.repository = repository
  }

  execute(endpoint: string, params?: AdminListParams): Promise<AdminPaginatedResult> {
    return this.repository.list(endpoint, params)
  }
}
