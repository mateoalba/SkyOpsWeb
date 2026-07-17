// src/infrastructure/adapters/profile-repository.adapter.ts
import type { AxiosInstance } from 'axios'
import type { ProfileRepository } from '@/domain/ports/profile-repository.port'
import type { UserProfile } from '@/domain/entities/user-profile.entity'
import type { TipoDocumento, Genero } from '@/domain/enums/profile-choices.enum'
import type { UpdateProfileDto } from '@/application/dtos/update-profile.dto'
import type { ChangePasswordDto } from '@/application/dtos/change-password.dto'
import { parseApiError } from '@/infrastructure/http/parse-api-error'

/**
 * Forma cruda (snake_case) tal como la devuelve PerfilUsuarioSerializer.
 */
interface RawUserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  date_joined: string
  pais: string
  tipo_documento: TipoDocumento | ''
  numero_documento: string | null
  fecha_nacimiento: string | null
  genero: Genero | ''
  telefono: string
  cargo: string
  es_operador: boolean
  foto: string | null
}

function toUserProfile(raw: RawUserProfile): UserProfile {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    firstName: raw.first_name,
    lastName: raw.last_name,
    isStaff: raw.is_staff,
    dateJoined: raw.date_joined,
    pais: raw.pais,
    tipoDocumento: raw.tipo_documento,
    numeroDocumento: raw.numero_documento,
    fechaNacimiento: raw.fecha_nacimiento,
    genero: raw.genero,
    telefono: raw.telefono,
    cargo: raw.cargo,
    esOperador: raw.es_operador,
    foto: raw.foto,
  }
}

function toRawPayload(dto: UpdateProfileDto): Record<string, string> {
  const payload: Record<string, string> = {}
  if (dto.firstName !== undefined) payload.first_name = dto.firstName
  if (dto.lastName !== undefined) payload.last_name = dto.lastName
  if (dto.pais !== undefined) payload.pais = dto.pais
  if (dto.tipoDocumento !== undefined) payload.tipo_documento = dto.tipoDocumento
  if (dto.numeroDocumento !== undefined) payload.numero_documento = dto.numeroDocumento
  if (dto.fechaNacimiento !== undefined) payload.fecha_nacimiento = dto.fechaNacimiento
  if (dto.genero !== undefined) payload.genero = dto.genero
  if (dto.telefono !== undefined) payload.telefono = dto.telefono
  return payload
}

/**
 * Adaptador concreto del port `ProfileRepository`, implementado con Axios
 * contra /api/auth/perfil/ y /api/auth/cambiar-password/.
 */
export class ProfileRepositoryAxiosAdapter implements ProfileRepository {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const { data } = await this.http.get<RawUserProfile>('/auth/perfil/')
      return toUserProfile(data)
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async updateProfile(payload: UpdateProfileDto): Promise<UserProfile> {
    try {
      const { data } = await this.http.patch<RawUserProfile>('/auth/perfil/', toRawPayload(payload))
      return toUserProfile(data)
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async changePassword(payload: ChangePasswordDto): Promise<void> {
    try {
      await this.http.post('/auth/cambiar-password/', {
        password_actual: payload.passwordActual,
        password_nuevo: payload.passwordNuevo,
        password_nuevo2: payload.passwordNuevo2,
      })
    } catch (error) {
      throw parseApiError(error)
    }
  }
}
