// src/presentation/pages/institutional/AboutPage.tsx
import { useEffect, useState } from 'react'
import { Search, Ticket, ShieldCheck, Users, Code2, Workflow } from 'lucide-react'
import { PageHero } from '@/presentation/components/institutional/page-hero'
import { ImagePlaceholder } from '@/presentation/components/institutional/image-placeholder'
import { listInstitutionalContentUseCase } from '@/infrastructure/factories/institutional-content.factory'
import { CLAVES, resolveBlock, toContentMap, type InstitutionalContentMap } from '@/presentation/config/institutional-content.registry'
import type { InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'

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
    <ImagePlaceholder key="image" label={`Espacio para una captura de "${item.titulo}"`} className="h-52 w-full sm:h-64" />
  )
  const info = (
    <div key="info">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="text-xl font-semibold text-white">{item.titulo}</p>
      <p className="mt-2 text-sm text-white/60">{item.texto}</p>
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

  const hero = resolveBlock(content, CLAVES.ABOUT_HERO, {
    titulo: 'Así construimos SkyOps',
    texto: 'Un sistema de control de vuelos de aeropuerto, hecho como proyecto académico con las mismas piezas de un producto real: búsqueda y reserva de vuelos, autenticación, y un panel de administración completo.',
  })
  const features = resolveBlock(content, CLAVES.ABOUT_FEATURES, { items: DEFAULT_FEATURES }).items
  const stack = resolveBlock(content, CLAVES.ABOUT_STACK, { items: DEFAULT_STACK }).items
  const team = resolveBlock(content, CLAVES.ABOUT_TEAM, { items: DEFAULT_TEAM }).items

  return (
    <div className="flex flex-col">
      <PageHero crumbs={[{ label: 'Compañía' }, { label: 'Acerca de SkyOps' }]} title={hero.titulo} subtitle={hero.texto}>
        <ImagePlaceholder label="Espacio para una foto del equipo o del proyecto" className="mt-8 h-56 w-full sm:h-72" />
      </PageHero>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-14">
          <h2 className="text-2xl font-semibold tracking-tight">Qué hicimos</h2>
          {features.map((item, i) => (
            <FeatureRow key={i} item={item} Icon={FEATURE_ICONS[i % FEATURE_ICONS.length]} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Cómo trabajamos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stack.map((item, i) => {
              const Icon = STACK_ICONS[i % STACK_ICONS.length]
              return (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold text-white">{item.titulo}</p>
                  <p className="mt-1 text-sm text-white/60">{item.texto}</p>
                </div>
              )
            })}
          </div>

          <ImagePlaceholder
            label="Espacio para un diagrama de arquitectura o una captura del código"
            className="mt-8 h-64 w-full sm:h-80"
          />
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <h2 className="mb-2 text-2xl font-semibold tracking-tight">El equipo</h2>
          <p className="mb-8 text-sm text-white/50">
            Espacio para presentar a cada integrante — edítalo desde /admin/contenido-institucional con su nombre y rol reales.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <ImagePlaceholder compact className="h-24 w-24 rounded-full" />
                <div>
                  <p className="font-semibold text-white">{member.titulo}</p>
                  <p className="text-sm text-white/50">{member.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
