// src/domain/ports/profile-repository.port.ts
import type { UserProfile } from '@/domain/entities/user-profile.entity'
import type { UpdateProfileDto } from '@/application/dtos/update-profile.dto'
import type { ChangePasswordDto } from '@/application/dtos/change-password.dto'

/**
 * Puerto (contrato) del perfil del usuario autenticado. La capa
 * infrastructure lo implementa contra /api/auth/perfil/ y
 * /api/auth/cambiar-password/.
 */
export interface ProfileRepository {
  getProfile(): Promise<UserProfile>
  updateProfile(payload: UpdateProfileDto): Promise<UserProfile>
  changePassword(payload: ChangePasswordDto): Promise<void>
}
