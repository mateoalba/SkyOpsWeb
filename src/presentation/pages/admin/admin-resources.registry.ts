// src/presentation/pages/admin/admin-resources.registry.ts
import {
  Building2,
  MapPin,
  Plane,
  DoorOpen,
  PlaneTakeoff,
  Users,
  Ticket,
  UserCog,
  ClipboardList,
  AlertTriangle,
  Building,
  Route,
  Clock,
  Waypoints,
  Luggage,
  Tag,
  Bell,
  UserCircle,
  LogIn,
  History,
  Wrench,
  Award,
  Image,
  LayoutGrid,
  Radar,
  FileText,
  type LucideIcon,
} from 'lucide-react'

export interface AdminResourceConfig {
  slug: string
  title: string
  endpoint: string
  /** Columnas que no queremos mostrar en la tabla genérica (además de "id", que siempre se oculta). */
  hiddenColumns?: string[]
  /** Ícono decorativo para la tarjeta del dashboard y el panel de cuenta. */
  icon?: LucideIcon
}

export interface AdminResourceSection {
  title: string
  /** Ícono decorativo del encabezado de la sección. */
  icon: LucideIcon
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
    icon: LayoutGrid,
    resources: [
      { slug: 'aerolineas', title: 'Aerolíneas', endpoint: '/aerolineas/', icon: Building2 },
      { slug: 'aeropuertos', title: 'Aeropuertos', endpoint: '/aeropuertos/', icon: MapPin },
      { slug: 'aeronaves', title: 'Aeronaves', endpoint: '/aeronaves/', icon: Plane },
      { slug: 'puertas', title: 'Puertas', endpoint: '/puertas/', icon: DoorOpen },
      { slug: 'vuelos', title: 'Vuelos', endpoint: '/vuelos/', icon: PlaneTakeoff },
      { slug: 'pasajeros', title: 'Pasajeros', endpoint: '/pasajeros/', icon: Users },
      { slug: 'reservas', title: 'Reservas', endpoint: '/reservas/', icon: Ticket },
      { slug: 'tripulantes', title: 'Tripulantes', endpoint: '/tripulantes/', icon: UserCog },
      {
        slug: 'asignaciones-tripulacion',
        title: 'Asignaciones de Tripulación',
        endpoint: '/asignaciones/',
        icon: ClipboardList,
      },
      { slug: 'incidentes', title: 'Incidentes', endpoint: '/incidentes/', icon: AlertTriangle },
    ],
  },
  {
    title: 'Operaciones',
    icon: Radar,
    resources: [
      { slug: 'terminales', title: 'Terminales', endpoint: '/terminales/', icon: Building },
      { slug: 'pistas', title: 'Pistas de Aterrizaje', endpoint: '/pistas/', icon: Route },
      {
        slug: 'asignaciones-pista',
        title: 'Asignaciones de Pista',
        endpoint: '/asignaciones-pista/',
        icon: ClipboardList,
      },
      { slug: 'horarios', title: 'Horarios de Vuelo', endpoint: '/horarios/', icon: Clock },
      { slug: 'escalas', title: 'Escalas de Vuelo', endpoint: '/escalas/', icon: Waypoints },
    ],
  },
  {
    title: 'Flota',
    icon: PlaneTakeoff,
    resources: [
      { slug: 'tipos-aeronave', title: 'Tipos de Aeronave', endpoint: '/tipos-aeronave/', icon: Plane },
    ],
  },
  {
    title: 'Pasajeros',
    icon: Users,
    resources: [
      { slug: 'equipajes', title: 'Equipajes', endpoint: '/equipajes/', icon: Luggage },
      { slug: 'tarjetas-embarque', title: 'Tarjetas de Embarque', endpoint: '/tarjetas-embarque/', icon: Ticket },
      {
        slug: 'categorias-pasajero',
        title: 'Categorías de Pasajero',
        endpoint: '/categorias-pasajero/',
        icon: Tag,
      },
      { slug: 'notificaciones', title: 'Notificaciones', endpoint: '/notificaciones/', icon: Bell },
    ],
  },
  {
    title: 'Usuarios y Mantenimiento',
    icon: Wrench,
    resources: [
      {
        slug: 'perfiles-usuario',
        title: 'Perfiles de Usuario',
        endpoint: '/perfiles-usuario/',
        // "usuario" es el id numérico del User de Django (poco útil en la tabla);
        // "id" del propio PerfilUsuario ya se oculta siempre por defecto.
        hiddenColumns: ['usuario'],
        icon: UserCircle,
      },
      { slug: 'sesiones-usuario', title: 'Sesiones de Usuario', endpoint: '/sesiones-usuario/', icon: LogIn },
      { slug: 'audit-log', title: 'Audit Log', endpoint: '/audit-log/', icon: History },
      {
        slug: 'mantenimientos',
        title: 'Mantenimiento de Aeronaves',
        endpoint: '/mantenimientos/',
        icon: Wrench,
      },
      {
        slug: 'certificaciones',
        title: 'Certificaciones de Tripulante',
        endpoint: '/certificaciones/',
        icon: Award,
      },
      { slug: 'banners', title: 'Banners Promocionales', endpoint: '/banners/', icon: Image },
      {
        slug: 'contenido-institucional',
        title: 'Contenido Institucional',
        endpoint: '/contenido-institucional/',
        icon: FileText,
      },
    ],
  },
]

export const ADMIN_RESOURCES: AdminResourceConfig[] = ADMIN_RESOURCE_SECTIONS.flatMap((s) => s.resources)

export function findAdminResource(slug: string | undefined): AdminResourceConfig | undefined {
  return ADMIN_RESOURCES.find((r) => r.slug === slug)
}
