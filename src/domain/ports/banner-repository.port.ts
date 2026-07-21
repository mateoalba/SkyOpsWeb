// src/domain/ports/banner-repository.port.ts
import type { PromoBanner } from '@/domain/entities/promo-banner.entity'

/**
 * Puerto (contrato) de banners promocionales. GET /api/banners/ es público
 * (sin login) — se usa en el Home y en el header de login.
 */
export interface UpdateBannerPayload {
  titulo?: string
  texto?: string
  imagenUrl?: string
  /** Archivo local a subir (multipart). Tiene prioridad sobre `imagenUrl` si viene presente. */
  imagenArchivo?: File
  /** Si es true, elimina la imagen actual (tanto la subida como la de URL). */
  quitarImagen?: boolean
}

export interface BannerRepository {
  getBanner(clave: string): Promise<PromoBanner | null>
  listBanners(): Promise<PromoBanner[]>
  updateBanner(clave: string, payload: UpdateBannerPayload): Promise<PromoBanner>
}
