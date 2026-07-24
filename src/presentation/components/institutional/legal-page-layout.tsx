import { useEffect, useState } from 'react'
import { PageHero } from '@/presentation/components/institutional/page-hero'
import { ImagePlaceholder } from '@/presentation/components/institutional/image-placeholder'
import { AdminEditableSection } from '@/presentation/components/admin/admin-editable-section'
import { cn } from '@/presentation/utils/cn'
import { listInstitutionalContentUseCase } from '@/infrastructure/factories/institutional-content.factory'
import {
  getBlockConfig,
  resolveBlock,
  toContentMap,
  type InstitutionalContentMap,
} from '@/presentation/config/institutional-content.registry'
import type { InstitutionalContent } from '@/domain/entities/institutional-content.entity'

interface LegalSection {
  heading: string
  body: string[]
  /** Texto del espacio reservado para la imagen de esta tarjeta. */
  image: string
  /** Tarjeta destacada a todo el ancho (imagen + texto lado a lado), en vez de ir dentro de la grilla. */
  featured?: boolean
}

function SectionCard({ section }: { section: LegalSection }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <ImagePlaceholder label={section.image} className="h-44 w-full rounded-none border-0 border-b border-border sm:h-52" />
      <div className="p-6">
        <h2 className="mb-2 text-lg font-semibold text-foreground">{section.heading}</h2>
        <div className="space-y-2">
          {section.body.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeaturedCard({ section }: { section: LegalSection }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row">
      <ImagePlaceholder
        label={section.image}
        className="h-48 w-full rounded-none border-0 sm:h-auto sm:w-2/5 sm:border-r sm:border-border"
      />
      <div className="flex-1 p-8">
        <h2 className="mb-3 text-2xl font-semibold text-foreground">{section.heading}</h2>
        <div className="space-y-3">
          {section.body.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * Layout compartido por las 4 páginas legales (términos, privacidad,
 * cookies, condiciones de transporte). Cada sección es una tarjeta con
 * imagen + título + texto — mismo ancho (max-w-[1280px]) que el resto del
 * sitio. `columns` controla cuántas tarjetas van por fila en la grilla (las
 * que no son `featured`). `sections` es el contenido por defecto (y define
 * qué tarjeta es `featured`, algo estructural que se mantiene en código);
 * `clave` apunta al bloque editable en /admin/contenido — si un admin
 * guardó texto para esa clave, cada sección usa su encabezado/texto/imagen
 * en vez del valor por defecto (mismo criterio que el resto de páginas
 * institucionales).
 */
export function LegalPageLayout({
  title,
  updatedAt,
  clave,
  sections,
  columns = 2,
}: {
  title: string
  updatedAt: string
  clave: string
  sections: LegalSection[]
  columns?: 2 | 3
}) {
  const [content, setContent] = useState<InstitutionalContentMap>({})

  useEffect(() => {
    listInstitutionalContentUseCase.execute().then((list) => setContent(toContentMap(list))).catch(() => setContent({}))
  }, [])

  const handleSaved = (updated: InstitutionalContent) => {
    setContent((prev) => ({ ...prev, [updated.clave]: updated }))
  }

  const resolved = resolveBlock(content, clave, {
    items: sections.map((s) => ({ titulo: s.heading, texto: s.body.join('\n\n'), extra: s.image })),
  })
  const items = resolved.items

  const merged: LegalSection[] = sections.map((section, i) => {
    const item = items[i]
    if (!item) return section
    return {
      heading: item.titulo || section.heading,
      body: item.texto ? splitParagraphs(item.texto) : section.body,
      image: item.extra || section.image,
      featured: section.featured,
    }
  })

  const featured = merged.filter((s) => s.featured)
  const rest = merged.filter((s) => !s.featured)

  return (
    <div className="flex flex-col">
      <PageHero
        crumbs={[{ label: 'Información legal' }, { label: title }]}
        title={title}
        subtitle={`Última actualización: ${updatedAt}.`}
        bannerClave={`${clave}_hero`}
      />

      <section className="px-4 py-14 sm:px-6">
        <AdminEditableSection
          clave={clave}
          config={getBlockConfig(clave)}
          initialValues={resolved}
          onSaved={handleSaved}
          className="mx-auto flex w-full max-w-[1280px] flex-col gap-6"
        >
          {featured.map((section, i) => (
            <FeaturedCard key={i} section={section} />
          ))}

          <div className={cn('grid grid-cols-1 gap-6', columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2')}>
            {rest.map((section, i) => (
              <SectionCard key={i} section={section} />
            ))}
          </div>
        </AdminEditableSection>
      </section>
    </div>
  )
}
