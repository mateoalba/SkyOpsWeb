// src/infrastructure/http/parse-api-error.ts
import axios from 'axios'
import { ApiException } from '@/domain/exceptions/api-exception'

interface DrfErrorBody {
  detail?: string
  error?: string
  [key: string]: unknown
}

/**
 * DRF suele devolver errores de validación como { campo: ["mensaje"] }.
 * Tomamos el primer mensaje del primer campo como fallback legible.
 */
function firstFieldError(data: DrfErrorBody | undefined): string | undefined {
  if (!data) return undefined
  for (const key of Object.keys(data)) {
    const value = data[key]
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0]
    }
  }
  return undefined
}

/**
 * Normaliza cualquier error (Axios u otro) a una ApiException con un
 * mensaje legible en español, para que la capa de presentación no tenga
 * que conocer la forma de los errores de Django REST Framework.
 */
export function parseApiError(error: unknown): ApiException {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data as DrfErrorBody | undefined

    if (status === 401) {
      return new ApiException('Debes iniciar sesión para ver esta información.', status)
    }
    if (status === 403) {
      return new ApiException('No tienes permisos para realizar esta acción.', status)
    }
    if (status === 404) {
      return new ApiException('No se encontró el recurso solicitado.', status)
    }

    const message =
      data?.detail ??
      data?.error ??
      firstFieldError(data) ??
      (status >= 500
        ? 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.'
        : 'Ocurrió un error al procesar la solicitud.')

    return new ApiException(message, status)
  }

  if (error instanceof Error) {
    return new ApiException(error.message, 0)
  }

  return new ApiException('Ocurrió un error inesperado.', 0)
}
