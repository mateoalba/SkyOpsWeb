// src/domain/exceptions/api-exception.ts

/**
 * Excepción de dominio para errores provenientes de la API.
 * `status` es el código HTTP (0 si fue un error de red/desconocido).
 */
export class ApiException extends Error {
  readonly status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiException'
    this.status = status
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}

export class DomainException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainException'
  }
}
