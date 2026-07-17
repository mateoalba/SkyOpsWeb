// src/application/use-cases/change-password.use-case.ts
import type { ProfileRepository } from '@/domain/ports/profile-repository.port'
import type { ChangePasswordDto } from '@/application/dtos/change-password.dto'

export class ChangePasswordUseCase {
  private readonly profileRepository: ProfileRepository

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository
  }

  execute(dto: ChangePasswordDto): Promise<void> {
    return this.profileRepository.changePassword(dto)
  }
}
