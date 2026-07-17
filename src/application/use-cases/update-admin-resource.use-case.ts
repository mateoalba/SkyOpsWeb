// src/application/use-cases/update-admin-resource.use-case.ts
import type { AdminResourceRepository, AdminRecord } from '@/domain/ports/admin-resource-repository.port'

export class UpdateAdminResourceUseCase {
  private readonly repository: AdminResourceRepository

  constructor(repository: AdminResourceRepository) {
    this.repository = repository
  }

  execute(endpoint: string, id: string, payload: AdminRecord): Promise<AdminRecord> {
    return this.repository.update(endpoint, id, payload)
  }
}
