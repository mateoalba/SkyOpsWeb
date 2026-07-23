// src/application/use-cases/google-login.use-case.ts
import type { AuthRepository, AuthSession } from '@/domain/ports/auth-repository.port'

export class GoogleLoginUseCase {
  private readonly authRepository: AuthRepository

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository
  }

  execute(idToken: string): Promise<AuthSession> {
    return this.authRepository.loginWithGoogle(idToken)
  }
}
