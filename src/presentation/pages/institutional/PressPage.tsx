// src/presentation/pages/institutional/PressPage.tsx
import { useEffect, useState } from 'react'
import { PageHero } from '@/presentation/components/institutional/page-hero'
import { ImagePlaceholder } from '@/presentation/components/institutional/image-placeholder'
import { listInstitutionalContentUseCase } from '@/infrastructure/factories/institutional-content.factory'
import { CLAVES, resolveBlock, toContentMap, type InstitutionalContentMap } from '@/presentation/config/institutional-content.registry'
import type { InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'

const DEFAULT_UPDATES: InstitutionalContentItem[] = [
  {
    titulo: 'Lanzamos la búsqueda y reserva de vuelos',
    texto: 'El primer gran hito del proyecto: buscar vuelos reales por origen, destino y fecha, y reservarlos desde una cuenta.',
    extra: '',
  },
  {
    titulo: 'Sumamos el panel de administración',
    texto: 'Control completo de aeronaves, tripulación, puertas de embarque, incidentes y mantenimiento, todo en un solo lugar.',
    extra: '',
  },
  {
    titulo: 'Mejoramos la interfaz y el filtro de vuelos',
    texto: 'Rediseño del buscador con filtros por fecha, y ajustes de interfaz en aeronaves, pasajeros y puertas de embarque.',
    extra: '',
  },
  {
    titulo: 'Habilitamos el inicio de sesión con Google',
    texto: 'Además del registro con correo, ahora se puede entrar a SkyOps con una cuenta de Google en un solo paso.',
    extra: '',
  },
]

export default function PressPage() {
  const [content, setContent] = useState<InstitutionalContentMap>({})

  useEffect(() => {
    listInstitutionalContentUseCase.execute().then((list) => setContent(toContentMap(list))).catch(() => setContent({}))
  }, [])

  const hero = resolveBlock(content, CLAVES.PRESS_HERO, {
    titulo: 'Novedades del proyecto',
    texto: 'Los avances más importantes de SkyOps a lo largo del desarrollo.',
  })
  const updates = resolveBlock(content, CLAVES.PRESS_UPDATES, { items: DEFAULT_UPDATES }).items

  return (
    <div className="flex flex-col">
      <PageHero crumbs={[{ label: 'Compañía' }, { label: 'Sala de prensa' }]} title={hero.titulo} subtitle={hero.texto}>
        <ImagePlaceholder label="Espacio para una imagen destacada de prensa" className="mt-8 h-56 w-full sm:h-72" />
      </PageHero>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 sm:grid-cols-2">
          {updates.map((update, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <ImagePlaceholder label="Espacio para una captura o imagen de esta novedad" className="h-40 w-full rounded-b-none" />
              <div className="p-6">
                <p className="font-semibold text-white">{update.titulo}</p>
                <p className="mt-2 text-sm text-white/60">{update.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
