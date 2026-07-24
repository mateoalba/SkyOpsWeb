// src/presentation/pages/institutional/CareersPage.tsx
import { useEffect, useState } from 'react'
import { GitBranch, Lightbulb, MessagesSquare } from 'lucide-react'
import { PageHero } from '@/presentation/components/institutional/page-hero'
import { ImagePlaceholder } from '@/presentation/components/institutional/image-placeholder'
import { AdminEditableSection } from '@/presentation/components/admin/admin-editable-section'
import { listInstitutionalContentUseCase } from '@/infrastructure/factories/institutional-content.factory'
import {
  CLAVES,
  getBlockConfig,
  resolveBlock,
  toContentMap,
  type InstitutionalContentMap,
} from '@/presentation/config/institutional-content.registry'
import type { InstitutionalContent, InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'

const DEFAULT_WAYS: InstitutionalContentItem[] = [
  {
    titulo: 'Aporta código',
    texto: 'SkyOps sigue creciendo. Si quieres sumar una funcionalidad o corregir algo, cuéntanos y coordinamos cómo integrarlo.',
    extra: '',
  },
  {
    titulo: 'Propón ideas',
    texto: 'Ya sea una mejora de interfaz o una funcionalidad nueva, toda idea ayuda a que el proyecto se sienta más completo.',
    extra: '',
  },
  {
    titulo: 'Reporta un problema',
    texto: 'Si encuentras algo que no funciona como debería, avísanos para poder revisarlo y corregirlo.',
    extra: '',
  },
]
const WAYS_ICONS = [GitBranch, Lightbulb, MessagesSquare]

export default function CareersPage() {
  const [content, setContent] = useState<InstitutionalContentMap>({})

  useEffect(() => {
    listInstitutionalContentUseCase.execute().then((list) => setContent(toContentMap(list))).catch(() => setContent({}))
  }, [])

  const handleSaved = (updated: InstitutionalContent) => {
    setContent((prev) => ({ ...prev, [updated.clave]: updated }))
  }

  const hero = resolveBlock(content, CLAVES.CAREERS_HERO, {
    titulo: 'Súmate al proyecto',
    texto: 'SkyOps es un proyecto académico en constante desarrollo dentro de la Universidad UTE. No es una empresa que contrata, pero sí un espacio abierto a quien quiera aportar.',
  })
  const intro = resolveBlock(content, CLAVES.CAREERS_INTRO, {
    titulo: 'Un proyecto vivo, siempre en construcción',
    texto: 'Cada versión de SkyOps suma algo nuevo. Si te interesa el desarrollo de software, la aviación o simplemente quieres aprender viendo un proyecto real por dentro, hay lugar para ti.',
  })
  const ways = resolveBlock(content, CLAVES.CAREERS_WAYS, { items: DEFAULT_WAYS })

  return (
    <div className="flex flex-col">
      <PageHero
        crumbs={[{ label: 'Compañía' }, { label: 'Trabaja con nosotros' }]}
        title={hero.titulo}
        subtitle={hero.texto}
        bannerClave={CLAVES.CAREERS_HERO}
        editable={{ clave: CLAVES.CAREERS_HERO, config: getBlockConfig(CLAVES.CAREERS_HERO), initialValues: hero, onSaved: handleSaved }}
      />

      <section className="px-4 pt-14 sm:px-6">
        <AdminEditableSection
          clave={CLAVES.CAREERS_INTRO}
          config={getBlockConfig(CLAVES.CAREERS_INTRO)}
          initialValues={intro}
          onSaved={handleSaved}
          className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-8 sm:grid-cols-2"
        >
          <ImagePlaceholder
            label="Espacio para una foto del equipo trabajando"
            className="h-64 w-full sm:h-80"
            imageUrl={intro.imagenUrl}
          />
          <div>
            <p className="text-2xl font-semibold text-foreground">{intro.titulo}</p>
            <p className="mt-3 text-sm text-muted-foreground">{intro.texto}</p>
          </div>
        </AdminEditableSection>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <AdminEditableSection
            clave={CLAVES.CAREERS_WAYS}
            config={getBlockConfig(CLAVES.CAREERS_WAYS)}
            initialValues={ways}
            onSaved={handleSaved}
            className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4"
          >
            {ways.items.map((item, i) => {
              const Icon = WAYS_ICONS[i % WAYS_ICONS.length]
              return (
                <div key={i} className="rounded-xl bg-card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{item.titulo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.texto}</p>
                </div>
              )
            })}
          </AdminEditableSection>

          <p className="mt-10 text-sm text-muted-foreground">
            Escríbenos desde <a href="mailto:contacto@skyops.edu" className="font-medium text-primary hover:underline">contacto@skyops.edu</a> — completa este correo con el que use el equipo del proyecto.
          </p>
        </div>
      </section>
    </div>
  )
}
