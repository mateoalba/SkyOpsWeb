// src/presentation/config/institutional-content.registry.ts
import type { InstitutionalContent, InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'

/** Claves fijas de cada bloque editable — usadas tanto por las páginas públicas como por el admin. */
export const CLAVES = {
  ABOUT_HERO: 'about_hero',
  ABOUT_FEATURES: 'about_features',
  ABOUT_STACK: 'about_stack',
  ABOUT_TEAM: 'about_team',
  HELP_HERO: 'help_hero',
  HELP_FAQ: 'help_faq',
  PRESS_HERO: 'press_hero',
  PRESS_UPDATES: 'press_updates',
  CAREERS_HERO: 'careers_hero',
  CAREERS_INTRO: 'careers_intro',
  CAREERS_WAYS: 'careers_ways',
  GITHUB_HERO: 'github_hero',
  GITHUB_REPOS: 'github_repos',
  LEGAL_TERMINOS: 'legal_terminos',
  LEGAL_PRIVACIDAD: 'legal_privacidad',
  LEGAL_COOKIES: 'legal_cookies',
  LEGAL_TRANSPORTE: 'legal_transporte',
} as const

export interface ItemFieldLabels {
  titulo: string
  texto: string
  extra?: string
}

export interface ContentBlockConfig {
  clave: string
  pageLabel: string
  blockLabel: string
  /** Si el bloque usa el campo `titulo`/`texto` de nivel superior (encabezados simples). */
  tituloLabel?: string
  textoLabel?: string
  /** Si el bloque usa la lista `items` (tarjetas, preguntas, integrantes...). */
  itemsLabel?: string
  itemFields?: ItemFieldLabels
}

export const CONTENT_BLOCKS: ContentBlockConfig[] = [
  {
    clave: CLAVES.ABOUT_HERO,
    pageLabel: 'Acerca de SkyOps',
    blockLabel: 'Encabezado',
    tituloLabel: 'Título grande',
    textoLabel: 'Subtítulo',
  },
  {
    clave: CLAVES.ABOUT_FEATURES,
    pageLabel: 'Acerca de SkyOps',
    blockLabel: 'Qué hicimos',
    itemsLabel: 'Tarjetas',
    itemFields: { titulo: 'Título', texto: 'Descripción' },
  },
  {
    clave: CLAVES.ABOUT_STACK,
    pageLabel: 'Acerca de SkyOps',
    blockLabel: 'Cómo trabajamos',
    itemsLabel: 'Tarjetas',
    itemFields: { titulo: 'Título', texto: 'Descripción' },
  },
  {
    clave: CLAVES.ABOUT_TEAM,
    pageLabel: 'Acerca de SkyOps',
    blockLabel: 'El equipo',
    itemsLabel: 'Integrantes',
    itemFields: { titulo: 'Nombre', texto: 'Rol en el proyecto' },
  },
  {
    clave: CLAVES.HELP_HERO,
    pageLabel: 'Centro de ayuda',
    blockLabel: 'Encabezado',
    tituloLabel: 'Título grande',
    textoLabel: 'Subtítulo',
  },
  {
    clave: CLAVES.HELP_FAQ,
    pageLabel: 'Centro de ayuda',
    blockLabel: 'Preguntas frecuentes',
    itemsLabel: 'Preguntas',
    itemFields: { titulo: 'Pregunta', texto: 'Respuesta' },
  },
  {
    clave: CLAVES.PRESS_HERO,
    pageLabel: 'Sala de prensa',
    blockLabel: 'Encabezado',
    tituloLabel: 'Título grande',
    textoLabel: 'Subtítulo',
  },
  {
    clave: CLAVES.PRESS_UPDATES,
    pageLabel: 'Sala de prensa',
    blockLabel: 'Novedades',
    itemsLabel: 'Novedades',
    itemFields: { titulo: 'Título', texto: 'Descripción' },
  },
  {
    clave: CLAVES.CAREERS_HERO,
    pageLabel: 'Trabaja con nosotros',
    blockLabel: 'Encabezado',
    tituloLabel: 'Título grande',
    textoLabel: 'Subtítulo',
  },
  {
    clave: CLAVES.CAREERS_INTRO,
    pageLabel: 'Trabaja con nosotros',
    blockLabel: 'Introducción',
    tituloLabel: 'Título',
    textoLabel: 'Texto',
  },
  {
    clave: CLAVES.CAREERS_WAYS,
    pageLabel: 'Trabaja con nosotros',
    blockLabel: 'Formas de ayudar',
    itemsLabel: 'Tarjetas',
    itemFields: { titulo: 'Título', texto: 'Descripción' },
  },
  {
    clave: CLAVES.GITHUB_HERO,
    pageLabel: 'GitHub',
    blockLabel: 'Encabezado',
    tituloLabel: 'Título grande',
    textoLabel: 'Subtítulo',
  },
  {
    clave: CLAVES.GITHUB_REPOS,
    pageLabel: 'GitHub',
    blockLabel: 'Repositorios',
    itemsLabel: 'Repositorios',
    itemFields: { titulo: 'Nombre', texto: 'Descripción', extra: 'Tecnologías (separadas por coma)' },
  },
  {
    clave: CLAVES.LEGAL_TERMINOS,
    pageLabel: 'Términos y condiciones',
    blockLabel: 'Secciones',
    itemsLabel: 'Secciones',
    itemFields: { titulo: 'Encabezado', texto: 'Texto (deja una línea en blanco entre párrafos)', extra: 'Descripción de la imagen' },
  },
  {
    clave: CLAVES.LEGAL_PRIVACIDAD,
    pageLabel: 'Política de privacidad',
    blockLabel: 'Secciones',
    itemsLabel: 'Secciones',
    itemFields: { titulo: 'Encabezado', texto: 'Texto (deja una línea en blanco entre párrafos)', extra: 'Descripción de la imagen' },
  },
  {
    clave: CLAVES.LEGAL_COOKIES,
    pageLabel: 'Política de cookies',
    blockLabel: 'Secciones',
    itemsLabel: 'Secciones',
    itemFields: { titulo: 'Encabezado', texto: 'Texto (deja una línea en blanco entre párrafos)', extra: 'Descripción de la imagen' },
  },
  {
    clave: CLAVES.LEGAL_TRANSPORTE,
    pageLabel: 'Condiciones de transporte',
    blockLabel: 'Secciones',
    itemsLabel: 'Secciones',
    itemFields: { titulo: 'Encabezado', texto: 'Texto (deja una línea en blanco entre párrafos)', extra: 'Descripción de la imagen' },
  },
]

export type InstitutionalContentMap = Record<string, InstitutionalContent>

export function toContentMap(list: InstitutionalContent[]): InstitutionalContentMap {
  return Object.fromEntries(list.map((c) => [c.clave, c]))
}

export function getBlockConfig(clave: string): ContentBlockConfig {
  const config = CONTENT_BLOCKS.find((b) => b.clave === clave)
  if (!config) throw new Error(`No hay configuración registrada para la clave "${clave}".`)
  return config
}

interface BlockFallback {
  titulo?: string
  texto?: string
  items?: InstitutionalContentItem[]
}

/**
 * Resuelve un bloque: usa lo guardado por el admin campo a campo, y cae al
 * valor por defecto (el texto actual hardcodeado) en los campos vacíos —
 * mismo criterio que ya usa el Home con los banners (`banner?.titulo ||
 * 'texto por defecto'`), así ninguna página se queda "vacía" mientras nadie
 * ha configurado nada todavía. `imagenUrl` no tiene fallback: si nadie subió
 * una imagen todavía, queda `null` y la página muestra el placeholder.
 */
export function resolveBlock(map: InstitutionalContentMap, clave: string, fallback: BlockFallback) {
  const found = map[clave]
  return {
    titulo: found?.titulo || fallback.titulo || '',
    texto: found?.texto || fallback.texto || '',
    items: found && found.items.length > 0 ? found.items : (fallback.items ?? []),
    // '' (no `null`), igual que ya hace BannerForm con imagenUrl: encaja
    // directo como initialValues del formulario, y en un `if (imagenUrl)`
    // para decidir si mostrar la imagen real o el placeholder se comporta
    // idéntico a `null`.
    imagenUrl: found?.imagenUrl || '',
  }
}
