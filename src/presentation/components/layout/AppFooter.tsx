// src/presentation/components/layout/AppFooter.tsx
import type { SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { PlaneTakeoff, ExternalLink } from 'lucide-react'

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
function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.5 12.3c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.7 0-1.9-.9-3.1-.8-1.6 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3.1.7c1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.5-3.5ZM15.2 5.1c.6-.8 1.1-1.9.9-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 3-1.3Z" />
    </svg>
  )
}
function GooglePlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4.5 2.9c-.3.3-.5.7-.5 1.3v15.6c0 .6.2 1 .5 1.3l.1.1L13.4 12v-.1L4.6 2.8l-.1.1Z" fill="#00D4FF" />
      <path d="M16.4 15l-3-3v-.1l3-3 6.7 3.9c.6.3.6.9 0 1.2l-6.7 3.9v.1Z" fill="#FFCE00" />
      <path d="M16.4 15 13.4 12 4.6 20.9c.3.3.9.4 1.5.1l10.3-6Z" fill="#00F076" />
      <path d="M16.4 9 6.1 3.1c-.6-.3-1.2-.2-1.5.1l9.4 8.9L16.4 9Z" fill="#FF3A44" />
    </svg>
  )
}

const APP_BADGES = [
  { label: 'Descárgalo en el App Store', Icon: AppleIcon },
  { label: 'Disponible en Google Play', Icon: GooglePlayIcon },
]

interface FooterLink {
  label: string
  to: string
  external?: boolean
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Sobre nosotros',
    links: [
      { label: 'Acerca de SkyOps', to: '/about' },
      { label: 'Centro de ayuda', to: '/help' },
      { label: 'Sala de prensa', to: '/press' },
      { label: 'Trabaja con nosotros', to: '/careers' },
    ],
  },
  {
    title: 'Nuestros portales',
    links: [
      { label: 'Universidad UTE', to: 'https://ute.edu.ec/', external: true },
      { label: 'GitHub', to: '/github' },
      { label: 'Reserva de vuelos', to: '/flights' },
    ],
  },
  {
    title: 'Enlaces rápidos',
    links: [
      { label: 'Términos y condiciones', to: '/legal/terminos' },
      { label: 'Política de privacidad', to: '/legal/privacidad' },
      { label: 'Política de cookies', to: '/legal/cookies' },
      { label: 'Condiciones de transporte', to: '/legal/transporte' },
    ],
  },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/UTE.EC.Oficial/', Icon: FacebookIcon },
  { label: 'X (Twitter)', href: 'https://twitter.com/UTEoficial', Icon: XIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/c/UniversidadUTEOficial', Icon: YoutubeIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/ute_oficial/', Icon: InstagramIcon },
]

/**
 * Footer global del sitio, con la misma estructura de 3 columnas + barra
 * inferior que usa Avianca ("Sobre nosotros" / "Nuestros portales" /
 * "Enlaces rápidos", con redes sociales y copyright abajo). Cada link tiene
 * una página real registrada en AppRouter.tsx: las de "Sobre nosotros" y
 * "Enlaces rápidos" en src/presentation/pages/institutional/*, y las de
 * "Nuestros portales" son rutas internas reales (/admin, /flights) salvo la
 * de la Universidad UTE, que abre su sitio oficial en una pestaña nueva.
 */
export function AppFooter() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="mb-4 text-xl font-bold">{column.title}</p>
              <ul className="space-y-3">
                {column.links.map((link) =>
                  link.external ? (
                    <li key={link.label}>
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-base text-background/70 transition-colors hover:text-background"
                      >
                        {link.label}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link to={link.to} className="text-base text-background/70 transition-colors hover:text-background">
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-2 pb-3 pt-8 sm:px-3 sm:pb-4">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-background/10 bg-background/10 px-4 py-5 lg:flex-row">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
              <PlaneTakeoff className="h-4 w-4" />
              SkyOps
            </Link>
            <span className="h-4 w-px bg-background/20" aria-hidden="true" />
            <p className="whitespace-nowrap text-xs text-background/60">
              © {currentYear} SkyOps — Control de Vuelos de un Aeropuerto
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {APP_BADGES.map(({ label, Icon }) => (
              <span
                key={label}
                title="Reemplaza este botón con el link real a tu app en la tienda"
                className="flex h-11 items-center gap-2 rounded-lg border-2 border-dashed border-background/20 px-3 text-background/50"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium leading-tight">{label}</span>
              </span>
            ))}
          </div>

          <div className="flex gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
              >
                <Icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
