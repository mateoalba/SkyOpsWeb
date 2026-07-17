// src/domain/entities/promo-banner.entity.ts

/**
 * Entidad pura del dominio: banner promocional configurable por un admin.
 * Refleja BannerPromocionalSerializer (airport/serializers/banner_promocional.py).
 * `clave` identifica el espacio fijo del diseño (ver comentario en el
 * modelo Django): usamos "dashboard" para el hero del Home.
 */
export interface PromoBanner {
  clave: string
  titulo: string
  texto: string
  imagenUrl: string
  actualizadoEn: string
}
