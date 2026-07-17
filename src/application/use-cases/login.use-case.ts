// src/application/use-cases/login.use-case.ts
import type { AuthRepository, AuthSession } from '@/domain/ports/auth-repository.port'
import type { LoginDto } from '@/application/dtos/login.dto'

export class LoginUseCase {
  private readonly authRepository: AuthRepository

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository
  }

  execute(dto: LoginDto): Promise<AuthSession> {
    return this.authRepository.login(dto)
  }
}
