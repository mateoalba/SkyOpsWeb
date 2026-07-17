// src/application/use-cases/register.use-case.ts
import type { AuthRepository, AuthSession } from '@/domain/ports/auth-repository.port'
import type { RegisterDto } from '@/application/dtos/register.dto'

export class RegisterUseCase {
  private readonly authRepository: AuthRepository

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository
  }

  execute(dto: RegisterDto): Promise<AuthSession> {
    return this.authRepository.register(dto)
  }
}
