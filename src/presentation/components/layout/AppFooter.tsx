// src/presentation/components/layout/AppFooter.tsx
import type { SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { PlaneTakeoff } from 'lucide-react'

const currentYear = new Date().getFullYear()

// lucide-react (a partir de v1) ya no incluye íconos de marcas por temas de
// trademark, así que estos 4 van como SVG inline en vez de importarlos.
function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.9.3-1.5 1.6-1.5H16.5V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10.5H8v3h2.3V21h3.2Z" />
    </svg>
  )
}
function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 4l7.2 9.4L4.4 20H6.6l5.7-5.9L16.5 20H20l-7.6-9.9L19.6 4h-2.2l-5.3 5.5L8 4H4Zm2.9 1.5h1.9l9.1 12h-1.9L6.9 5.5Z" />
    </svg>
  )
}
function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 7.5a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.6A2.7 2.7 0 0 0 2.4 7.5 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.5 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.6a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.5ZM10 15V9l5.2 3-5.2 3Z" />
    </svg>
  )
}
function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'SkyOps',
    links: [
      { label: 'Inicio', to: '/' },
      { label: 'Vuelos', to: '/flights' },
      { label: 'Aerolíneas', to: '/airlines' },
      { label: 'Aeropuertos', to: '/airports' },
      { label: 'Mis reservas', to: '/mis-reservas' },
      { label: 'Mi perfil', to: '/profile' },
    ],
  },
  {
    title: 'Información legal',
    links: [
      { label: 'Términos y condiciones', to: '/legal/terminos' },
      { label: 'Política de privacidad', to: '/legal/privacidad' },
      { label: 'Política de cookies', to: '/legal/cookies' },
      { label: 'Condiciones de transporte', to: '/legal/transporte' },
    ],
  },
  {
    title: 'Compañía',
    links: [
      { label: 'Acerca de SkyOps', to: '/about' },
      { label: 'Centro de ayuda', to: '/help' },
      { label: 'Sala de prensa', to: '/press' },
      { label: 'Trabaja con nosotros', to: '/careers' },
    ],
  },
]

/**
 * Footer global del sitio (inspirado en la estructura típica de una
 * aerolínea comercial: columnas de navegación + redes + legal). Los links
 * a secciones que todavía no existen (legal, ayuda, etc.) apuntan a rutas
 * que hoy caen en el catch-all "/" — se pueden convertir en páginas reales
 * más adelante sin tocar este componente.
 */
export function AppFooter() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="mb-3 text-sm font-semibold">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-background/70 transition-colors hover:text-background">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="mb-3 text-sm font-semibold">Contáctanos</p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
              >
                <XIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-6 sm:flex-row">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
            <PlaneTakeoff className="h-4 w-4" />
            SkyOps
          </Link>
          <p className="text-xs text-background/60">
            © {currentYear} SkyOps — Proyecto académico de Control de Vuelos de un Aeropuerto.
          </p>
        </div>
      </div>
    </footer>
  )
}
