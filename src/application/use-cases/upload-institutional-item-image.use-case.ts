// src/application/use-cases/upload-institutional-item-image.use-case.ts
import type { InstitutionalContentRepository } from '@/domain/ports/institutional-content-repository.port'

export class UploadInstitutionalItemImageUseCase {
  private readonly institutionalContentRepository: InstitutionalContentRepository

  constructor(institutionalContentRepository: InstitutionalContentRepository) {
    this.institutionalContentRepository = institutionalContentRepository
  }

  execute(file: File): Promise<string> {
    return this.institutionalContentRepository.uploadItemImage(file)
  }
}
