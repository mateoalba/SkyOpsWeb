// src/application/dtos/register.dto.ts

/**
 * Payload de entrada para POST /api/auth/registro/.
 * Solo se piden los campos esenciales del formulario; los campos de
 * perfil (país, documento, fecha de nacimiento, género, teléfono) son
 * opcionales en el backend y se agregan más adelante desde /auth/perfil/.
 */
export interface RegisterDto {
  email: string
  firstName: string
  lastName: string
  password: string
  password2: string
}
