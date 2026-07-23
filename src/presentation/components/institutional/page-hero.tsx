import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb {
  label: string
  to?: string
}

/**
 * Encabezado compartido de las páginas institucionales (Acerca de, Ayuda,
 * Prensa, Trabaja con nosotros, legales): breadcrumb + título grande +
 * subtítulo, mismo fondo oscuro/tipografía grande que ya usa HomePage
 * (bg-black, text-3xl sm:text-5xl) para que se sienta parte del mismo sitio.
 */
export function PageHero({
  crumbs,
  title,
  subtitle,
  children,
}: {
  crumbs: Crumb[]
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <section className="bg-black px-4 pb-10 pt-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-white/50">
          <Link to="/" className="flex items-center gap-1 hover:text-white/80">
            <Home className="h-3.5 w-3.5" />
            Inicio
          </Link>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.label}>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-white/80">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-white">{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">{subtitle}</p>}

        {children}
      </div>
    </section>
  )
}
