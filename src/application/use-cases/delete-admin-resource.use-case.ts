// src/application/use-cases/delete-admin-resource.use-case.ts
import type { AdminResourceRepository } from '@/domain/ports/admin-resource-repository.port'

export class DeleteAdminResourceUseCase {
  private readonly repository: AdminResourceRepository

  constructor(repository: AdminResourceRepository) {
    this.repository = repository
  }

  execute(endpoint: string, id: string): Promise<void> {
    return this.repository.remove(endpoint, id)
  }
}
