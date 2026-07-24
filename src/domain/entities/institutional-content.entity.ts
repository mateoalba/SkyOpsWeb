// src/domain/entities/institutional-content.entity.ts

/**
 * Un ítem genérico de lista (tarjeta de funcionalidad, pregunta de FAQ,
 * integrante del equipo, repositorio...). Qué representa cada campo depende
 * de la `clave` del bloque — ver institutional-content.registry.ts en
 * presentation, que trae las etiquetas correctas para el admin.
 */
export interface InstitutionalContentItem {
  titulo: string
  texto: string
  extra: string
  /** Solo las tarjetas de los bloques que lo permiten (ver `itemImage` en el registry). */
  imagenUrl?: string
}

export interface InstitutionalContent {
  clave: string
  titulo: string
  texto: string
  items: InstitutionalContentItem[]
  /** Solo los bloques "hero" de cada página la usan por ahora. */
  imagenUrl: string | null
  actualizadoEn: string
}
