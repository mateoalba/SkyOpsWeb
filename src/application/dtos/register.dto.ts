// src/application/dtos/register.dto.ts
import type { TipoDocumento, Genero } from '@/domain/enums/profile-choices.enum'

/**
 * Payload de entrada para POST /api/auth/registro/.
 * Los campos de perfil (país, documento, fecha de nacimiento, género,
 * teléfono) son opcionales en el backend, pero el formulario los pide todos
 * completos: si vienen numero_documento + fecha_nacimiento el backend crea
 * de una vez el registro de Pasajero, así el usuario puede reservar vuelos
 * apenas se registra (sin tener que completar su perfil después).
 */
export interface RegisterDto {
  email: string
  firstName: string
  lastName: string
  password: string
  password2: string
  pais?: string
  tipoDocumento?: TipoDocumento | ''
  numeroDocumento?: string
  fechaNacimiento?: string
  genero?: Genero | ''
  telefono?: string
}
