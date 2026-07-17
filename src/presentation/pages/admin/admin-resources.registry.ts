// src/presentation/pages/admin/admin-resources.registry.ts

export interface AdminResourceConfig {
  slug: string
  title: string
  endpoint: string
  /** Columnas que no queremos mostrar en la tabla genérica (además de "id", que siempre se oculta). */
  hiddenColumns?: string[]
}

export interface AdminResourceSection {
  title: string
  resources: AdminResourceConfig[]
}

/**
 * Las 25 tablas del backend (ver README.md del repo skyops) + banners,
 * agrupadas igual que en la documentación de la API. `slug` es lo que va
 * en la URL (/admin/:slug) y `endpoint` es la ruta real bajo /api/.
 *
 * La mayoría de estos slugs ahora tienen una página dedicada con CRUD
 * completo (ver AppRouter.tsx); los que no la tienen todavía (sesiones-usuario,
 * audit-log) caen en el visor genérico de solo lectura AdminResourceListPage.
 */
export const ADMIN_RESOURCE_SECTIONS: AdminResourceSection[] = [
  {
    title: 'Recursos principales',
    resources: [
      { slug: 'aerolineas', title: 'Aerolíneas', endpoint: '/aerolineas/' },
      { slug: 'aeropuertos', title: 'Aeropuertos', endpoint: '/aeropuertos/' },
      { slug: 'aeronaves', title: 'Aeronaves', endpoint: '/aeronaves/' },
      { slug: 'puertas', title: 'Puertas', endpoint: '/puertas/' },
      { slug: 'vuelos', title: 'Vuelos', endpoint: '/vuelos/' },
      { slug: 'pasajeros', title: 'Pasajeros', endpoint: '/pasajeros/' },
      { slug: 'reservas', title: 'Reservas', endpoint: '/reservas/' },
      { slug: 'tripulantes', title: 'Tripulantes', endpoint: '/tripulantes/' },
      { slug: 'asignaciones-tripulacion', title: 'Asignaciones de Tripulación', endpoint: '/asignaciones/' },
      { slug: 'incidentes', title: 'Incidentes', endpoint: '/incidentes/' },
    ],
  },
  {
    title: 'Módulo Operaciones',
    resources: [
      { slug: 'terminales', title: 'Terminales', endpoint: '/terminales/' },
      { slug: 'pistas', title: 'Pistas de Aterrizaje', endpoint: '/pistas/' },
      { slug: 'asignaciones-pista', title: 'Asignaciones de Pista', endpoint: '/asignaciones-pista/' },
      { slug: 'horarios', title: 'Horarios de Vuelo', endpoint: '/horarios/' },
      { slug: 'escalas', title: 'Escalas de Vuelo', endpoint: '/escalas/' },
    ],
  },
  {
    title: 'Módulo Pasajeros y Flota',
    resources: [
      { slug: 'tipos-aeronave', title: 'Tipos de Aeronave', endpoint: '/tipos-aeronave/' },
      { slug: 'equipajes', title: 'Equipajes', endpoint: '/equipajes/' },
      { slug: 'tarjetas-embarque', title: 'Tarjetas de Embarque', endpoint: '/tarjetas-embarque/' },
      { slug: 'categorias-pasajero', title: 'Categorías de Pasajero', endpoint: '/categorias-pasajero/' },
      { slug: 'notificaciones', title: 'Notificaciones', endpoint: '/notificaciones/' },
    ],
  },
  {
    title: 'Módulo Usuarios y Mantenimiento',
    resources: [
      {
        slug: 'perfiles-usuario',
        title: 'Perfiles de Usuario',
        endpoint: '/perfiles-usuario/',
        // "usuario" es el id numérico del User de Django (poco útil en la tabla);
        // "id" del propio PerfilUsuario ya se oculta siempre por defecto.
        hiddenColumns: ['usuario'],
      },
      { slug: 'sesiones-usuario', title: 'Sesiones de Usuario', endpoint: '/sesiones-usuario/' },
      { slug: 'audit-log', title: 'Audit Log', endpoint: '/audit-log/' },
      { slug: 'mantenimientos', title: 'Mantenimiento de Aeronaves', endpoint: '/mantenimientos/' },
      { slug: 'certificaciones', title: 'Certificaciones de Tripulante', endpoint: '/certificaciones/' },
      { slug: 'banners', title: 'Banners Promocionales', endpoint: '/banners/' },
    ],
  },
]

export const ADMIN_RESOURCES: AdminResourceConfig[] = ADMIN_RESOURCE_SECTIONS.flatMap((s) => s.resources)

export function findAdminResource(slug: string | undefined): AdminResourceConfig | undefined {
  return ADMIN_RESOURCES.find((r) => r.slug === slug)
}
