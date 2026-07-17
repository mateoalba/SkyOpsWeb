// src/domain/entities/user-profile.entity.ts
import type { TipoDocumento, Genero } from '@/domain/enums/profile-choices.enum'

/**
 * Entidad pura del dominio: perfil completo del usuario autenticado.
 * Refleja PerfilUsuarioSerializer (airport/serializers/auth.py), que
 * combina campos de auth.User con los de PerfilUsuario (uno-a-uno).
 */
export interface UserProfile {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  isStaff: boolean
  dateJoined: string

  pais: string
  tipoDocumento: TipoDocumento | ''
  numeroDocumento: string | null
  fechaNacimiento: string | null
  genero: Genero | ''
  telefono: string

  cargo: string
  esOperador: boolean
  foto: string | null
}
