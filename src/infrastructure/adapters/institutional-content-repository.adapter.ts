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
  actualizado_en: string
}

function toItem(raw: RawItem): InstitutionalContentItem {
  return { titulo: raw.titulo ?? '', texto: raw.texto ?? '', extra: raw.extra ?? '' }
}

function toInstitutionalContent(raw: RawInstitutionalContent): InstitutionalContent {
  return {
    clave: raw.clave,
    titulo: raw.titulo,
    texto: raw.texto,
    items: (raw.items ?? []).map(toItem),
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
      const { data } = await this.http.put<RawInstitutionalContent>(`/contenido-institucional/${clave}/`, {
        titulo: payload.titulo,
        texto: payload.texto,
        items: payload.items,
      })
      return toInstitutionalContent(data)
    } catch (error) {
      throw parseApiError(error)
    }
  }
}
