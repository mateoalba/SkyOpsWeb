// src/domain/entities/auth-user.entity.ts

/**
 * Entidad pura del dominio: usuario autenticado.
 * Combina lo que devuelve el backend en `usuario` (login/registro) con,
 * en el caso del registro, los datos que el propio formulario ya conocía
 * (first_name/last_name) porque el backend no los repite en esa respuesta.
 */
export interface AuthUser {
  id: number
  username: string
  email: string
  nombre: string
  apellido: string
  esStaff: boolean
}
