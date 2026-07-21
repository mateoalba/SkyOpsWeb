// src/infrastructure/adapters/banner-repository.adapter.ts
import type { AxiosInstance } from 'axios'
import type { BannerRepository, UpdateBannerPayload } from '@/domain/ports/banner-repository.port'
import type { PromoBanner } from '@/domain/entities/promo-banner.entity'
import { parseApiError } from '@/infrastructure/http/parse-api-error'

interface RawBanner {
  clave: string
  titulo: string
  texto: string
  imagen_url: string
  actualizado_en: string
}

function toPromoBanner(raw: RawBanner): PromoBanner {
  return {
    clave: raw.clave,
    titulo: raw.titulo,
    texto: raw.texto,
    imagenUrl: raw.imagen_url,
    actualizadoEn: raw.actualizado_en,
  }
}

/**
 * Adaptador concreto del port `BannerRepository`. El backend solo expone
 * GET /api/banners/ (lista completa, sin filtro por clave), así que
 * buscamos la clave pedida en el cliente. Si esa clave nunca fue guardada
 * por un admin, no existe fila todavía y devolvemos null (el Home cae al
 * banner por defecto).
 */
export class BannerRepositoryAxiosAdapter implements BannerRepository {
  private readonly http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  async getBanner(clave: string): Promise<PromoBanner | null> {
    try {
      const { data } = await this.http.get<RawBanner[]>('/banners/')
      const match = data.find((b) => b.clave === clave)
      return match ? toPromoBanner(match) : null
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async listBanners(): Promise<PromoBanner[]> {
    try {
      const { data } = await this.http.get<RawBanner[]>('/banners/')
      return data.map(toPromoBanner)
    } catch (error) {
      throw parseApiError(error)
    }
  }

  async updateBanner(clave: string, payload: UpdateBannerPayload): Promise<PromoBanner> {
    try {
      if (payload.imagenArchivo) {
        const formData = new FormData()
        if (payload.titulo !== undefined) formData.append('titulo', payload.titulo)
        if (payload.texto !== undefined) formData.append('texto', payload.texto)
        formData.append('imagen_upload', payload.imagenArchivo)
        const { data } = await this.http.put<RawBanner>(`/banners/${clave}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        return toPromoBanner(data)
      }

      const { data } = await this.http.put<RawBanner>(`/banners/${clave}/`, {
        titulo: payload.titulo,
        texto: payload.texto,
        imagen_url: payload.imagenUrl,
        quitar_imagen: payload.quitarImagen ?? false,
      })
      return toPromoBanner(data)
    } catch (error) {
      throw parseApiError(error)
    }
  }
}
