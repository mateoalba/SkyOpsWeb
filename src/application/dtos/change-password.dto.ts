// src/application/dtos/change-password.dto.ts

/**
 * Payload de entrada para POST /api/auth/cambiar-password/.
 */
export interface ChangePasswordDto {
  passwordActual: string
  passwordNuevo: string
  passwordNuevo2: string
}
