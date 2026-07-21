// src/presentation/pages/flights/HomePage.tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlaneTakeoff, Search, Info, X, Ticket, ShieldCheck } from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import type { PromoBanner } from '@/domain/entities/promo-banner.entity'
import { getBannerUseCase } from '@/infrastructure/factories/banner.factory'
import { Button } from '@/presentation/components/ui/button'
import { FlightSearchBar } from '@/presentation/components/flight-search-bar'
import { DestinationOffersSection } from '@/presentation/components/destination-offers-section'

/**
 * Barra superior oscura y descartable, tipo aviso de aerolínea
 * ("Encuentra vuelos disponibles entre..."). Solo vive en el estado
 * local: al recargar la página vuelve a aparecer, es informativa, no
 * bloquea nada.
 */
function TopInfoBar() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="flex items-center gap-3 bg-neutral-950 px-4 py-2.5 text-xs text-white/80 sm:px-6 sm:text-sm">
      <Info className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1">
        Monitorea en tiempo real cada despegue y aterrizaje del aeropuerto.{' '}
        <Link to="/flights" className="font-semibold text-white underline underline-offset-2">
          Conoce más
        </Link>
        .
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso"
        className="shrink-0 rounded-full p-1 transition-colors hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/**
 * Panel de búsqueda: fondo oscuro sólido (no foto) con el toggle
 * "Ida y vuelta / Solo ida" tipo pill. Origen/Destino, Salida/Regreso y el
 * botón Buscar comparten la misma altura fija en desktop (lg:h-16) y el
 * mismo radio de borde (rounded-xl). Salida/Regreso abren un calendario de
 * dos meses (FlightCalendarPopover) con leyenda de precio por color, igual
 * que en un buscador de vuelos de aerolínea comercial.
 *
 * El ancho de este formulario (padding en la <section>, max-w-[1280px] en el
 * elemento hijo) es la referencia de ancho que replican todas las
 * secciones de abajo (PromoCard, Ofertas, Vuelos próximos, Features,
 * Audience), para que todo el Home quede alineado en los mismos bordes.
 */
function SearchPanel() {
  const navigate = useNavigate()
  return (
    <section className="px-4 pb-8 pt-10 sm:px-6">
      <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-3 text-center text-white">
        <PlaneTakeoff className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Tu próximo viaje empieza aqui</h1>
        <p className="max-w-2xl text-sm text-white/70 sm:whitespace-nowrap sm:text-base">
          Busca, compara y reserva vuelos fácilmente, con información real y actualizada al minuto.
        </p>
      </div>

      <FlightSearchBar
        className="mx-auto mt-8 max-w-[1280px]"
        onSearch={({ origen, destino, fecha }) => {
          const params = new URLSearchParams()
          if (origen) params.set('origen', origen)
          if (destino) params.set('destino', destino)
          if (fecha) params.set('fecha', fecha)
          navigate(`/flights${params.toString() ? `?${params.toString()}` : ''}`)
        }}
      />
    </section>
  )
}

/**
 * Envuelve SearchPanel + PromoCard bajo una sola imagen de fondo (banner
 * "home_hero"), para que la foto se vea detrás de ambas tarjetas y no solo
 * detrás del buscador. El degradado se apaga justo al final (hacia
 * neutral-950 sólido) para mezclarse con el fondo de la sección siguiente
 * ("Ofertas desde..."). Ninguna de las dos tarjetas hijas tiene ya su
 * propio fondo/imagen de sección — viven "encima" de esta capa compartida.
 */
function HeroSection() {
  const [banner, setBanner] = useState<PromoBanner | null>(null)

  useEffect(() => {
    getBannerUseCase.execute('home_hero').then(setBanner).catch(() => setBanner(null))
  }, [])

  return (
    <div className="relative overflow-hidden bg-neutral-950">
      {banner?.imagenUrl && (
        <>
          <img
            src={banner.imagenUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setBanner(null)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/75 via-neutral-950/85 to-neutral-950" />
        </>
      )}
      <div className="relative pb-20">
        <SearchPanel />
        <PromoCard />
      </div>
    </div>
  )
}

/**
 * Tarjeta promocional grande (imagen + texto), reutiliza el mismo banner
 * "dashboard" configurable desde el admin que antes usaba el hero con foto.
 * bg-neutral-800 (en vez de neutral-900) + borde para que se distinga del
 * fondo de la página en modo oscuro, que es casi del mismo tono que
 * neutral-900.
 */
function PromoCard() {
  const [banner, setBanner] = useState<PromoBanner | null>(null)

  useEffect(() => {
    getBannerUseCase.execute('dashboard').then(setBanner).catch(() => setBanner(null))
  }, [])

  const hasImage = Boolean(banner?.imagenUrl)

  return (
    <section className="px-4 sm:px-6">
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl border border-white/10">
        {hasImage ? (
          <img
            src={banner!.imagenUrl}
            alt=""
            className="h-56 w-full object-cover sm:h-80"
            onError={() => setBanner(null)}
          />
        ) : (
          <div className="h-56 w-full bg-gradient-to-br from-primary/40 via-neutral-700 to-neutral-900 sm:h-80" />
        )}

        {/* Sub-tarjeta translúcida encima de la foto, estilo Avianca: el
            título y la descripción siguen siendo el mismo banner "dashboard"
            configurable desde /admin/banners, solo cambió cómo se presentan. */}
        <div className="absolute inset-x-4 bottom-4 top-auto flex flex-col justify-center gap-3 rounded-2xl bg-black/55 p-6 backdrop-blur-md sm:inset-x-auto sm:inset-y-6 sm:left-6 sm:w-1/2 sm:p-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {banner?.titulo || 'Cada vuelo, bajo control'}
          </h2>
          <p className="text-base text-white/80 sm:text-lg">
            {banner?.texto ||
              'Desde el despegue hasta el aterrizaje, sigue cada operación de la flota en tiempo real.'}
          </p>
          <Button
            asChild
            size="lg"
            className="ml-auto mt-auto w-fit rounded-full bg-black px-10 py-7 text-lg text-white hover:bg-black/80"
          >
            <Link to="/flights">Ver vuelos</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

/**
 * 3 tarjetas de funcionalidades reales de SkyOps (no beneficios inventados
 * tipo "check-in" o "programa de millas" que el backend no modela).
 */
function FeaturesSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const features = [
    {
      icon: Search,
      title: 'Consulta vuelos en tiempo real',
      text: 'Filtra por origen, destino, fecha y estado — la información se actualiza al minuto.',
      to: '/flights',
      cta: 'Buscar vuelos',
    },
    {
      icon: Ticket,
      title: 'Reserva en minutos',
      text: 'Elige tu asiento, clase y número de pasajeros directamente desde la ficha del vuelo.',
      to: isAuthenticated ? '/flights' : '/register',
      cta: isAuthenticated ? 'Reservar ahora' : 'Crear cuenta',
    },
    {
      icon: ShieldCheck,
      title: 'Gestiona tus reservas',
      text: 'Revisa el estado de tus reservas y cancélalas cuando lo necesites, todo desde un solo lugar.',
      to: '/mis-reservas',
      cta: 'Ver mis reservas',
    },
  ]

  return (
    <section className="px-4 pb-20 pt-4 sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">Prepárate para volar</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.to}
              className="flex items-center gap-4 rounded-xl bg-black p-6 transition-colors hover:bg-neutral-900"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-white">{feature.title}</p>
                <p className="mt-1 text-sm text-white/60">{feature.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <TopInfoBar />
      <HeroSection />
      <section className="px-4 pb-16 pt-8 sm:px-6">
        <DestinationOffersSection extraLimit={4} className="mx-auto w-full max-w-[1280px]" />
      </section>
      <FeaturesSection />
    </div>
  )
}
