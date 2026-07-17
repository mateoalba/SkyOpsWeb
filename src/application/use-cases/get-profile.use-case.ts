// src/application/use-cases/get-profile.use-case.ts
import type { ProfileRepository } from '@/domain/ports/profile-repository.port'
import type { UserProfile } from '@/domain/entities/user-profile.entity'

export class GetProfileUseCase {
  private readonly profileRepository: ProfileRepository

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository
  }

  execute(): Promise<UserProfile> {
    return this.profileRepository.getProfile()
  }
}
