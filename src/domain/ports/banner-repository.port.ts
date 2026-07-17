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
}

export interface BannerRepository {
  getBanner(clave: string): Promise<PromoBanner | null>
  listBanners(): Promise<PromoBanner[]>
  updateBanner(clave: string, payload: UpdateBannerPayload): Promise<PromoBanner>
}
