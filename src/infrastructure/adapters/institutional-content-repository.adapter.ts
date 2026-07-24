// src/infrastructure/adapters/institutional-content-repository.adapter.ts
import type { AxiosInstance } from 'axios'
import type {
  InstitutionalContentRepository,
  UpdateInstitutionalContentPayload,
} from '@/domain/ports/institutional-content-repository.port'
import type { InstitutionalContent, InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'
import { parseApiError } from '@/infrastructure/http/parse-api-error'

interface RawItem {
  titulo?: string
  texto?: string
  extra?: string
}

interface RawInstitutionalContent {
  clave: string
  titulo: string
  texto: string
  items: RawItem[]
  imagen_url: string | null
  actualizado_en: string
}

function toItem(raw: RawItem): InstitutionalContentItem {
  return { titulo: raw.titulo ?? '', texto: raw.texto ?? '', extra: raw.extra ?? '' }
}

function toItemsArray(raw: RawInstitutionalContent['items']): RawItem[] {
  if (Array.isArray(raw)) return raw
  // Defensivo: un backend desactualizado (sin el parseo de 'items' como JSON
  // en multipart) puede devolver el string tal cual se mandó, en vez de la
  // lista ya decodificada. Nunca debe tumbar la página — si no es un array
  // usable, se trata como lista vacía.
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function toInstitutionalContent(raw: RawInstitutionalContent): InstitutionalContent {
  return {
    clave: raw.clave,
    titulo: raw.titulo,
    texto: raw.texto,
    items: toItemsArray(raw.items).map(toItem),
    imagenUrl: raw.imagen_url,
    actualizadoEn: raw.actualizado_en,
  }
}

/**
 * Adaptador concreto del port `InstitutionalContentRepository`. El backend
 * solo expone GET /api/contenido-institucional/ (lista completa, sin filtro
 * por clave) — igual que /api/banners/ — así que las páginas piden la lista
 * completa una sola vez y buscan sus propias claves en el cliente.
 */
export class InstitutionalContentRepositoryAxiosAdapter implements InstitutionalContentRepository {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  async listInstitutionalContent(): Promise<InstitutionalContent[]> {
    try {
      const { data } = await this.http.get<RawInstitutionalContent[]>('/contenido-institucional/')
      return data.map(toInstitutionalContent)
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async updateInstitutionalContent(
    clave: string,
    payload: UpdateInstitutionalContentPayload,
  ): Promise<InstitutionalContent> {
    try {
      if (payload.imagenArchivo) {
        const formData = new FormData()
        if (payload.titulo !== undefined) formData.append('titulo', payload.titulo)
        if (payload.texto !== undefined) formData.append('texto', payload.texto)
        if (payload.items !== undefined) formData.append('items', JSON.stringify(payload.items))
        formData.append('imagen_upload', payload.imagenArchivo)
        const { data } = await this.http.put<RawInstitutionalContent>(`/contenido-institucional/${clave}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        return toInstitutionalContent(data)
      }

      const { data } = await this.http.put<RawInstitutionalContent>(`/contenido-institucional/${clave}/`, {
        titulo: payload.titulo,
        texto: payload.texto,
        items: payload.items,
        imagen_url: payload.imagenUrl,
        quitar_imagen: payload.quitarImagen ?? false,
      })
      return toInstitutionalContent(data)
    } catch (error) {
      throw parseApiError(error)
    }
  }
}
