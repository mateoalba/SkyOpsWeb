// src/presentation/pages/institutional/HelpPage.tsx
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PageHero } from '@/presentation/components/institutional/page-hero'
import { ImagePlaceholder } from '@/presentation/components/institutional/image-placeholder'
import { listInstitutionalContentUseCase } from '@/infrastructure/factories/institutional-content.factory'
import { CLAVES, resolveBlock, toContentMap, type InstitutionalContentMap } from '@/presentation/config/institutional-content.registry'
import type { InstitutionalContentItem } from '@/domain/entities/institutional-content.entity'

const DEFAULT_FAQS: InstitutionalContentItem[] = [
  {
    titulo: '¿Cómo busco un vuelo?',
    texto: 'Usa el buscador de la página de inicio o entra a "Vuelos" en el menú superior. Puedes filtrar por origen, destino, fecha y estado del vuelo.',
    extra: '',
  },
  {
    titulo: '¿Necesito una cuenta para reservar?',
    texto: 'Sí. Puedes crear una cuenta con tu correo o iniciar sesión directamente con Google desde la pantalla de inicio de sesión.',
    extra: '',
  },
  {
    titulo: '¿Cómo reservo un vuelo?',
    texto: 'Entra a la ficha de un vuelo desde el listado y elige clase, asiento y número de pasajeros. La reserva queda asociada a tu cuenta.',
    extra: '',
  },
  {
    titulo: '¿Dónde veo mis reservas?',
    texto: 'En "Mis reservas", dentro del menú de tu cuenta, puedes revisar el estado de cada una y cancelarlas si lo necesitas.',
    extra: '',
  },
  {
    titulo: '¿Cómo actualizo mis datos personales?',
    texto: 'Desde "Mi perfil", en el menú de tu cuenta, puedes editar tus datos de contacto y documento.',
    extra: '',
  },
  {
    titulo: '¿Qué es SkyOps?',
    texto: 'Es un proyecto académico de control de vuelos de un aeropuerto, desarrollado en la Universidad UTE, que simula la operación real de una aerolínea: vuelos, reservas, tripulación, aeronaves y más.',
    extra: '',
  },
]

export default function HelpPage() {
  const [content, setContent] = useState<InstitutionalContentMap>({})

  useEffect(() => {
    listInstitutionalContentUseCase.execute().then((list) => setContent(toContentMap(list))).catch(() => setContent({}))
  }, [])

  const hero = resolveBlock(content, CLAVES.HELP_HERO, {
    titulo: 'Centro de ayuda',
    texto: 'Respuestas rápidas a las preguntas más comunes sobre SkyOps.',
  })
  const faqs = resolveBlock(content, CLAVES.HELP_FAQ, { items: DEFAULT_FAQS }).items

  return (
    <div className="flex flex-col">
      <PageHero crumbs={[{ label: 'Compañía' }, { label: 'Centro de ayuda' }]} title={hero.titulo} subtitle={hero.texto}>
        <ImagePlaceholder label="Espacio para una imagen del centro de ayuda" className="mt-8 h-56 w-full sm:h-72" />
      </PageHero>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-white/10 bg-white/5 open:bg-white/[0.08]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-white">
                  {faq.titulo}
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/50 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm text-white/60">{faq.texto}</p>
              </details>
            ))}
          </div>

          <ImagePlaceholder
            label="Espacio para una ilustración o captura de ayuda"
            className="h-64 lg:sticky lg:top-24 lg:h-full lg:min-h-[24rem]"
          />
        </div>
      </section>
    </div>
  )
}
