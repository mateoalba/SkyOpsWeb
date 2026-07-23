// src/domain/ports/auth-repository.port.ts
import type { AuthUser } from '@/domain/entities/auth-user.entity'
import type { LoginDto } from '@/application/dtos/login.dto'
import type { RegisterDto } from '@/application/dtos/register.dto'

export interface AuthSession {
  access: string
  refresh: string
  user: AuthUser
}

/**
 * Puerto (contrato) de autenticación. La capa infrastructure lo implementa
 * contra /api/auth/*; application solo conoce este contrato.
 */
export interface AuthRepository {
  login(credentials: LoginDto): Promise<AuthSession>
  register(payload: RegisterDto): Promise<AuthSession>
  loginWithGoogle(idToken: string): Promise<AuthSession>
  logout(refreshToken: string): Promise<void>
}
