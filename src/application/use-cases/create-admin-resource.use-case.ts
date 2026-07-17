// src/application/use-cases/create-admin-resource.use-case.ts
import type { AdminResourceRepository, AdminRecord } from '@/domain/ports/admin-resource-repository.port'

export class CreateAdminResourceUseCase {
  private readonly repository: AdminResourceRepository

  constructor(repository: AdminResourceRepository) {
    this.repository = repository
  }

  execute(endpoint: string, payload: AdminRecord): Promise<AdminRecord> {
    return this.repository.create(endpoint, payload)
  }
}
