// src/presentation/pages/institutional/GithubPage.tsx
import { useEffect, useState } from 'react'
import type { SVGProps } from 'react'
import { PageHero } from '@/presentation/components/institutional/page-hero'
import { ImagePlaceholder } from '@/presentation/components/institutional/image-placeholder'
import { listInstitutionalContentUseCase } from '@/infrastructure/factories/institutional-content.factory'
import { CLAVES, resolveBlock, toContentMap, type InstitutionalContentMap } from '@/presentation/config/institutional-content.registry'
import type { InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.9-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  )
}

const DEFAULT_REPOS: InstitutionalContentItem[] = [
  {
    titulo: 'skyops-web',
    texto: 'La aplicación web: búsqueda y reserva de vuelos, autenticación (correo y Google), panel de administración y todo lo que ve el usuario.',
    extra: 'React, TypeScript, Vite, Tailwind',
  },
  {
    titulo: 'skyops-api',
    texto: 'El backend: modela vuelos, aeronaves, tripulación, reservas e incidentes, con autenticación JWT y la lógica de negocio del control de vuelos.',
    extra: 'Django, Django REST Framework, PostgreSQL',
  },
  {
    titulo: 'skyops-mobile',
    texto: 'La app móvil: consume la misma API que el backend para que los usuarios busquen vuelos, reserven y gestionen su cuenta desde el celular.',
    extra: '',
  },
]

function RepoCard({ repo, reverse }: { repo: InstitutionalContentItem; reverse?: boolean }) {
  const stack = repo.extra
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const image = (
    <ImagePlaceholder
      key="image"
      label="Espacio para una captura del repositorio o su README"
      className="h-56 w-full sm:h-72"
    />
  )
  const info = (
    <div key="info">
      <div className="mb-3 flex items-center gap-2">
        <GithubIcon className="h-5 w-5 text-white/70" />
        <p className="font-mono text-lg font-semibold text-white">{repo.titulo}</p>
      </div>
      <p className="text-sm text-white/60">{repo.texto}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {stack.length > 0 ? (
          stack.map((tech) => (
            <span key={tech} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              {tech}
            </span>
          ))
        ) : (
          <span className="rounded-full border-2 border-dashed border-white/20 px-3 py-1 text-xs text-white/40">
            Agrega aquí el stack (ej. React Native, Flutter, Kotlin...)
          </span>
        )}
      </div>
      <div className="mt-5">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-white/20 px-5 py-2.5 text-sm font-medium text-white/50">
          <GithubIcon className="h-4 w-4" />
          Ver repositorio
        </span>
        <p className="mt-2 text-xs text-white/40">
          Reemplaza este botón con el link real a github.com/tu-usuario/{repo.titulo}
        </p>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
      {reverse ? [info, image] : [image, info]}
    </div>
  )
}

export default function GithubPage() {
  const [content, setContent] = useState<InstitutionalContentMap>({})

  useEffect(() => {
    listInstitutionalContentUseCase.execute().then((list) => setContent(toContentMap(list))).catch(() => setContent({}))
  }, [])

  const hero = resolveBlock(content, CLAVES.GITHUB_HERO, {
    titulo: 'Nuestro código en GitHub',
    texto: 'SkyOps está dividido en tres repositorios: la aplicación web, la API que la respalda, y la app móvil.',
  })
  const repos = resolveBlock(content, CLAVES.GITHUB_REPOS, { items: DEFAULT_REPOS }).items

  return (
    <div className="flex flex-col">
      <PageHero crumbs={[{ label: 'Compañía' }, { label: 'GitHub' }]} title={hero.titulo} subtitle={hero.texto}>
        <ImagePlaceholder label="Espacio para una imagen general del proyecto" className="mt-8 h-56 w-full sm:h-72" />
      </PageHero>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16">
          {repos.map((repo, i) => (
            <RepoCard key={i} repo={repo} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>
    </div>
  )
}
