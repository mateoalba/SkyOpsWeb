// src/infrastructure/adapters/auth-repository.adapter.ts
import type { AxiosInstance } from 'axios'
import type { AuthRepository, AuthSession } from '@/domain/ports/auth-repository.port'
import type { AuthUser } from '@/domain/entities/auth-user.entity'
import type { LoginDto } from '@/application/dtos/login.dto'
import type { RegisterDto } from '@/application/dtos/register.dto'
import { parseApiError } from '@/infrastructure/http/parse-api-error'

interface RawUsuarioLogin {
  id: number
  username: string
  email: string
  nombre: string
  apellido: string
  es_staff: boolean
  es_operador: boolean
}

interface RawLoginResponse {
  access: string
  refresh: string
  usuario: RawUsuarioLogin
}

interface RawUsuarioRegistro {
  id: number
  username: string
  email: string
}

interface RawRegistroResponse {
  mensaje: string
  usuario: RawUsuarioRegistro
  access: string
  refresh: string
}

interface RawUsuarioGoogle {
  id: number
  username: string
  email: string
  es_staff: boolean
}

interface RawGoogleLoginResponse {
  mensaje: string
  creado: boolean
  usuario: RawUsuarioGoogle
  access: string
  refresh: string
}

/**
 * Adaptador concreto del port `AuthRepository`, implementado con Axios
 * contra /api/auth/*. Esta es la única capa que conoce la forma real
 * (snake_case, distinta entre login y registro) de la respuesta del backend.
 */
export class AuthRepositoryAxiosAdapter implements AuthRepository {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  async login(credentials: LoginDto): Promise<AuthSession> {
    try {
      const { data } = await this.http.post<RawLoginResponse>('/auth/login/', {
        email: credentials.email,
        password: credentials.password,
      })
      const user: AuthUser = {
        id: data.usuario.id,
        username: data.usuario.username,
        email: data.usuario.email,
        nombre: data.usuario.nombre,
        apellido: data.usuario.apellido,
        esStaff: data.usuario.es_staff,
        esOperador: data.usuario.es_operador,
      }
      return { access: data.access, refresh: data.refresh, user }
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async register(payload: RegisterDto): Promise<AuthSession> {
    try {
      const { data } = await this.http.post<RawRegistroResponse>('/auth/registro/', {
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        password: payload.password,
        password2: payload.password2,
        pais: payload.pais,
        tipo_documento: payload.tipoDocumento,
        numero_documento: payload.numeroDocumento,
        fecha_nacimiento: payload.fechaNacimiento,
        genero: payload.genero,
        telefono: payload.telefono,
      })
      // La respuesta de registro no repite nombre/apellido/es_staff (a
      // diferencia del login): los completamos con lo que el propio
      // formulario ya conocía. Un registro público nunca crea un admin ni
      // un operador (esos roles los asigna un admin desde el backend), así
      // que ambos se completan en false sin necesidad de preguntarle al
      // servidor.
      const user: AuthUser = {
        id: data.usuario.id,
        username: data.usuario.username,
        email: data.usuario.email,
        nombre: payload.firstName,
        apellido: payload.lastName,
        esStaff: false,
        esOperador: false,
      }
      return { access: data.access, refresh: data.refresh, user }
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async loginWithGoogle(idToken: string): Promise<AuthSession> {
    try {
      const { data } = await this.http.post<RawGoogleLoginResponse>('/auth/google/', {
        id_token: idToken,
      })
      // El backend no repite nombre/apellido en esta respuesta (a diferencia
      // de /login/): quedan vacíos y la UI cae de vuelta al username, igual
      // que ya hace AppHeader.
      const user: AuthUser = {
        id: data.usuario.id,
        username: data.usuario.username,
        email: data.usuario.email,
        nombre: '',
        apellido: '',
        esStaff: data.usuario.es_staff,
        esOperador: false,
      }
      return { access: data.access, refresh: data.refresh, user }
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.http.post('/auth/logout/', { refresh: refreshToken })
    } catch (error) {
      throw parseApiError(error)
    }
  }
}
