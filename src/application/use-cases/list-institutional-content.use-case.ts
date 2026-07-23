// src/application/use-cases/list-institutional-content.use-case.ts
import type { InstitutionalContentRepository } from '@/domain/ports/institutional-content-repository.port'
import type { InstitutionalContent } from '@/domain/entities/institutional-content.entity'

export class ListInstitutionalContentUseCase {
  private readonly repository: InstitutionalContentRepository

  constructor(repository: InstitutionalContentRepository) {
    this.repository = repository
  }

  execute(): Promise<InstitutionalContent[]> {
    return this.repository.listInstitutionalContent()
  }
}
