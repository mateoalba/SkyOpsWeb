// src/presentation/pages/institutional/CareersPage.tsx
import { useEffect, useState } from 'react'
import { GitBranch, Lightbulb, MessagesSquare } from 'lucide-react'
import { PageHero } from '@/presentation/components/institutional/page-hero'
import { ImagePlaceholder } from '@/presentation/components/institutional/image-placeholder'
import { listInstitutionalContentUseCase } from '@/infrastructure/factories/institutional-content.factory'
import { CLAVES, resolveBlock, toContentMap, type InstitutionalContentMap } from '@/presentation/config/institutional-content.registry'
import type { InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'

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

  const hero = resolveBlock(content, CLAVES.CAREERS_HERO, {
    titulo: 'Súmate al proyecto',
    texto: 'SkyOps es un proyecto académico en constante desarrollo dentro de la Universidad UTE. No es una empresa que contrata, pero sí un espacio abierto a quien quiera aportar.',
  })
  const intro = resolveBlock(content, CLAVES.CAREERS_INTRO, {
    titulo: 'Un proyecto vivo, siempre en construcción',
    texto: 'Cada versión de SkyOps suma algo nuevo. Si te interesa el desarrollo de software, la aviación o simplemente quieres aprender viendo un proyecto real por dentro, hay lugar para ti.',
  })
  const ways = resolveBlock(content, CLAVES.CAREERS_WAYS, { items: DEFAULT_WAYS }).items

  return (
    <div className="flex flex-col">
      <PageHero crumbs={[{ label: 'Compañía' }, { label: 'Trabaja con nosotros' }]} title={hero.titulo} subtitle={hero.texto}>
        <ImagePlaceholder label="Espacio para una imagen de bienvenida" className="mt-8 h-56 w-full sm:h-72" />
      </PageHero>

      <section className="px-4 pt-14 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-8 sm:grid-cols-2">
          <ImagePlaceholder label="Espacio para una foto del equipo trabajando" className="h-64 w-full sm:h-80" />
          <div>
            <p className="text-2xl font-semibold text-white">{intro.titulo}</p>
            <p className="mt-3 text-sm text-white/60">{intro.texto}</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ways.map((item, i) => {
              const Icon = WAYS_ICONS[i % WAYS_ICONS.length]
              return (
                <div key={i} className="rounded-xl bg-black p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold text-white">{item.titulo}</p>
                  <p className="mt-1 text-sm text-white/60">{item.texto}</p>
                </div>
              )
            })}
          </div>

          <p className="mt-10 text-sm text-white/50">
            Escríbenos desde <a href="mailto:contacto@skyops.edu" className="font-medium text-primary hover:underline">contacto@skyops.edu</a> — completa este correo con el que use el equipo del proyecto.
          </p>
        </div>
      </section>
    </div>
  )
}
