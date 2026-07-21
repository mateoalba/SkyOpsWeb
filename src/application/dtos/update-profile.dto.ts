// src/application/dtos/update-profile.dto.ts
import type { TipoDocumento, Genero } from '@/domain/enums/profile-choices.enum'

/**
 * Payload de entrada para PATCH /api/auth/perfil/.
 */
export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  pais?: string
  tipoDocumento?: TipoDocumento | ''
  numeroDocumento?: string
  fechaNacimiento?: string
  genero?: Genero | ''
  telefono?: string
  /** Nueva foto de perfil a subir (multipart). Si no se envía, la foto actual no cambia. */
  fotoArchivo?: File | null
}
