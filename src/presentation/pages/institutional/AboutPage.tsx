// src/presentation/pages/institutional/AboutPage.tsx
import { useEffect, useState } from 'react'
import { Search, Ticket, ShieldCheck, Users, Code2, Workflow } from 'lucide-react'
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

const DEFAULT_FEATURES: InstitutionalContentItem[] = [
  {
    titulo: 'Búsqueda de vuelos en tiempo real',
    texto: 'Filtra por origen, destino, fecha y estado, con datos que se actualizan al minuto.',
    extra: '',
  },
  {
    titulo: 'Reservas de principio a fin',
    texto: 'Elige clase, asiento y número de pasajeros, y gestiona o cancela tus reservas después.',
    extra: '',
  },
  {
    titulo: 'Panel de administración completo',
    texto: 'Control de aeronaves, tripulación, puertas de embarque, incidentes y mantenimiento desde un solo lugar.',
    extra: '',
  },
]
const FEATURE_ICONS = [Search, Ticket, ShieldCheck]

const DEFAULT_STACK: InstitutionalContentItem[] = [
  {
    titulo: 'Frontend',
    texto: 'React, TypeScript y Tailwind, organizado en capas (dominio, aplicación, infraestructura, presentación) para mantener la lógica de negocio separada de la interfaz.',
    extra: '',
  },
  {
    titulo: 'Backend',
    texto: 'Django y Django REST Framework, con autenticación JWT (incluyendo inicio de sesión con Google) y una base de datos relacional.',
    extra: '',
  },
  {
    titulo: 'Metodología',
    texto: 'Entregas incrementales por funcionalidad, con control de versiones en Git a lo largo de todo el desarrollo.',
    extra: '',
  },
]
const STACK_ICONS = [Code2, Workflow, Users]

const DEFAULT_TEAM: InstitutionalContentItem[] = [
  { titulo: 'Nombre del integrante', texto: 'Rol en el proyecto', extra: '' },
  { titulo: 'Nombre del integrante', texto: 'Rol en el proyecto', extra: '' },
  { titulo: 'Nombre del integrante', texto: 'Rol en el proyecto', extra: '' },
  { titulo: 'Nombre del integrante', texto: 'Rol en el proyecto', extra: '' },
]

function FeatureRow({
  item,
  Icon,
  reverse,
}: {
  item: InstitutionalContentItem
  Icon: typeof Search
  reverse?: boolean
}) {
  const image = (
    <ImagePlaceholder
      key="image"
      label={`Espacio para una captura de "${item.titulo}"`}
      className="h-52 w-full sm:h-64"
      imageUrl={item.imagenUrl}
    />
  )
  const info = (
    <div key="info">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-2xl font-semibold text-foreground">{item.titulo}</p>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <p className="text-justify text-base text-muted-foreground">{item.texto}</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
      {reverse ? [info, image] : [image, info]}
    </div>
  )
}

export default function AboutPage() {
  const [content, setContent] = useState<InstitutionalContentMap>({})

  useEffect(() => {
    listInstitutionalContentUseCase.execute().then((list) => setContent(toContentMap(list))).catch(() => setContent({}))
  }, [])

  const handleSaved = (updated: InstitutionalContent) => {
    setContent((prev) => ({ ...prev, [updated.clave]: updated }))
  }

  const hero = resolveBlock(content, CLAVES.ABOUT_HERO, {
    titulo: 'Así construimos SkyOps',
    texto: 'Un sistema de control de vuelos de aeropuerto, hecho como proyecto académico con las mismas piezas de un producto real: búsqueda y reserva de vuelos, autenticación, y un panel de administración completo.',
  })
  const introImage = resolveBlock(content, CLAVES.ABOUT_INTRO_IMAGE, {})
  const features = resolveBlock(content, CLAVES.ABOUT_FEATURES, { items: DEFAULT_FEATURES })
  const stack = resolveBlock(content, CLAVES.ABOUT_STACK, { items: DEFAULT_STACK })
  const team = resolveBlock(content, CLAVES.ABOUT_TEAM, { items: DEFAULT_TEAM })

  return (
    <div className="flex flex-col">
      <PageHero
        crumbs={[{ label: 'Compañía' }, { label: 'Acerca de SkyOps' }]}
        title={hero.titulo}
        subtitle={hero.texto}
        bannerClave={CLAVES.ABOUT_HERO}
        editable={{ clave: CLAVES.ABOUT_HERO, config: getBlockConfig(CLAVES.ABOUT_HERO), initialValues: hero, onSaved: handleSaved }}
      />

      <section className="relative -mt-4 px-4 pb-0 sm:px-6">
        <div className="mx-auto w-full max-w-[1280px] border-b border-border">
          <AdminEditableSection
            clave={CLAVES.ABOUT_INTRO_IMAGE}
            config={getBlockConfig(CLAVES.ABOUT_INTRO_IMAGE)}
            initialValues={introImage}
            onSaved={handleSaved}
          >
            <ImagePlaceholder
              label="Espacio para una foto del equipo o del proyecto"
              className="h-36 w-full rounded-2xl sm:h-65"
              imageUrl={introImage.imagenUrl}
            />
          </AdminEditableSection>
        </div>
      </section>

      <section className="px-4 pb-14 pt-12 sm:px-6">
        <AdminEditableSection
          clave={CLAVES.ABOUT_FEATURES}
          config={getBlockConfig(CLAVES.ABOUT_FEATURES)}
          initialValues={features}
          onSaved={handleSaved}
          className="mx-auto flex w-full max-w-[1280px] flex-col gap-14"
        >
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Qué hicimos</h2>
          {features.items.map((item, i) => (
            <FeatureRow key={i} item={item} Icon={FEATURE_ICONS[i % FEATURE_ICONS.length]} reverse={i % 2 === 1} />
          ))}
        </AdminEditableSection>
      </section>

      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <AdminEditableSection
            clave={CLAVES.ABOUT_STACK}
            config={getBlockConfig(CLAVES.ABOUT_STACK)}
            initialValues={stack}
            onSaved={handleSaved}
          >
            <h2 className="mb-8 text-2xl font-semibold tracking-tight">Cómo trabajamos</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              {stack.items.map((item, i) => {
                const Icon = STACK_ICONS[i % STACK_ICONS.length]
                return (
                  <div key={i} className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">{item.titulo}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.texto}</p>
                  </div>
                )
              })}
            </div>

            <ImagePlaceholder
              label="Espacio para un diagrama de arquitectura o una captura del código"
              className="mt-8 h-64 w-full sm:h-80"
              imageUrl={stack.imagenUrl}
            />
          </AdminEditableSection>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <AdminEditableSection
            clave={CLAVES.ABOUT_TEAM}
            config={getBlockConfig(CLAVES.ABOUT_TEAM)}
            initialValues={team}
            onSaved={handleSaved}
          >
            <h2 className="mb-2 text-2xl font-semibold tracking-tight">El equipo</h2>
            <p className="mb-8 text-sm text-muted-foreground">Espacio para presentar a cada integrante.</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
              {team.items.map((member, i) => (
                <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
                  <ImagePlaceholder compact className="h-24 w-24 rounded-full" imageUrl={member.imagenUrl} />
                  <div>
                    <p className="font-semibold text-foreground">{member.titulo}</p>
                    <p className="text-sm text-muted-foreground">{member.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminEditableSection>
        </div>
      </section>
    </div>
  )
}
