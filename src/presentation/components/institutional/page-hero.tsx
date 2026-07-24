import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

import type { InstitutionalContent } from '@/domain/entities/institutional-content.entity'
import type { ContentBlockConfig } from '@/presentation/config/institutional-content.registry'
import type { InstitutionalContentFormValues } from '@/presentation/components/admin/institutional-content-form'
import { AdminEditableSection } from '@/presentation/components/admin/admin-editable-section'
import { getBannerUseCase } from '@/infrastructure/factories/banner.factory'

interface Crumb {
  label: string
  to?: string
}

interface EditableHero {
  clave: string
  config: ContentBlockConfig
  initialValues: InstitutionalContentFormValues
  onSaved: (updated: InstitutionalContent) => void
}

/**
 * Encabezado compartido de las páginas institucionales (Acerca de, Ayuda,
 * Prensa, Trabaja con nosotros, legales): breadcrumb + título grande +
 * subtítulo, sobre fondo oscuro — mismo lenguaje que el hero del Home.
 *
 * La imagen de fondo vive en el sistema de Banners (`bannerClave`, editable
 * desde /admin/banners → "Páginas institucionales"), igual que ya hace el
 * hero del Home o el de login — no en el contenido institucional, que aquí
 * solo cubre texto. Se pinta a toda la sección con un degradado oscuro
 * encima para que el título siga siendo legible.
 *
 * Si se pasa `editable`, el título/subtítulo quedan envueltos en
 * `AdminEditableSection` (clic para editar, solo staff) — el breadcrumb
 * queda siempre afuera de esa envoltura para no interceptar el link
 * "Inicio" con el clic de edición.
 */
export function PageHero({
  crumbs,
  title,
  subtitle,
  bannerClave,
  editable,
}: {
  crumbs: Crumb[]
  title: string
  subtitle?: string
  bannerClave?: string
  editable?: EditableHero
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!bannerClave) return
    getBannerUseCase
      .execute(bannerClave)
      .then((banner) => setImageUrl(banner?.imagenUrl || null))
      .catch(() => setImageUrl(null))
  }, [bannerClave])

  const content = (
    <>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">{subtitle}</p>}
    </>
  )

  return (
    <section className="relative flex min-h-[22rem] flex-col justify-center overflow-hidden bg-black px-4 py-16 text-white sm:px-6">
      {imageUrl && (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/70 to-black" />
        </>
      )}

      <div className="relative mx-auto w-full max-w-[1280px]">
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

        {editable ? (
          <AdminEditableSection
            clave={editable.clave}
            config={editable.config}
            initialValues={editable.initialValues}
            onSaved={editable.onSaved}
          >
            {content}
          </AdminEditableSection>
        ) : (
          content
        )}
      </div>
    </section>
  )
}
