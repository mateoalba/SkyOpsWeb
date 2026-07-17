// src/application/use-cases/logout.use-case.ts
import type { AuthRepository } from '@/domain/ports/auth-repository.port'

export class LogoutUseCase {
  private readonly authRepository: AuthRepository

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository
  }

  execute(refreshToken: string): Promise<void> {
    return this.authRepository.logout(refreshToken)
  }
}
