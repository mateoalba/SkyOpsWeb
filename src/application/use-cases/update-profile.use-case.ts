// src/application/use-cases/update-profile.use-case.ts
import type { ProfileRepository } from '@/domain/ports/profile-repository.port'
import type { UserProfile } from '@/domain/entities/user-profile.entity'
import type { UpdateProfileDto } from '@/application/dtos/update-profile.dto'

export class UpdateProfileUseCase {
  private readonly profileRepository: ProfileRepository

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository
  }

  execute(dto: UpdateProfileDto): Promise<UserProfile> {
    return this.profileRepository.updateProfile(dto)
  }
}
