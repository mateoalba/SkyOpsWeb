// src/application/use-cases/update-institutional-content.use-case.ts
import type {
  InstitutionalContentRepository,
  UpdateInstitutionalContentPayload,
} from '@/domain/ports/institutional-content-repository.port'
import type { InstitutionalContent } from '@/domain/entities/institutional-content.entity'

export class UpdateInstitutionalContentUseCase {
  private readonly repository: InstitutionalContentRepository

  constructor(repository: InstitutionalContentRepository) {
    this.repository = repository
  }

  execute(clave: string, payload: UpdateInstitutionalContentPayload): Promise<InstitutionalContent> {
    return this.repository.updateInstitutionalContent(clave, payload)
  }
}
