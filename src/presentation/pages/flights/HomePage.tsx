// src/presentation/pages/flights/HomePage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  ArrowRight,
  ArrowLeftRight,
  ChevronDown,
  LogIn,
  Search,
  Info,
  X,
  Ticket,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import { getFlightsUseCase } from '@/infrastructure/factories/flight.factory'
import type { Flight } from '@/domain/entities/flight.entity'
import type { PromoBanner } from '@/domain/entities/promo-banner.entity'
import { getBannerUseCase } from '@/infrastructure/factories/banner.factory'
import { Button } from '@/presentation/components/ui/button'
import { Card } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { FlightCalendarPopover } from '@/presentation/components/flight-calendar-popover'
import { formatPrice } from '@/presentation/utils/formatters'

type TripType = 'ida-vuelta' | 'solo-ida'

function formatShortDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(date)
}

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
  const [tripType, setTripType] = useState<TripType>('solo-ida')
  const [origen, setOrigen] = useState('')
  const [destino, setDestino] = useState('')
  const [salida, setSalida] = useState('')
  const [regreso, setRegreso] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (origen.trim()) params.set('origen', origen.trim().toUpperCase())
    if (destino.trim()) params.set('destino', destino.trim().toUpperCase())
    if (salida) params.set('fecha', salida)
    navigate(`/flights${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleSwap = () => {
    setOrigen(destino)
    setDestino(origen)
  }

  return (
    <section className="bg-neutral-950 px-4 pb-16 pt-10 sm:px-6">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-3 text-center text-white">
        <PlaneTakeoff className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Control total en cada despegue</h1>
        <p className="max-w-xl text-balance text-sm text-white/70 sm:text-base">
          Monitoreo de precisión para la aviación moderna: horarios, estados y rutas en tiempo real.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="relative mx-auto mt-8 w-full max-w-[1280px] rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl sm:p-10"
      >
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="inline-flex rounded-full bg-white/10 p-1.5">
            <button
              type="button"
              onClick={() => setTripType('ida-vuelta')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:text-base ${
                tripType === 'ida-vuelta' ? 'bg-white text-neutral-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Ida y vuelta
            </button>
            <button
              type="button"
              onClick={() => setTripType('solo-ida')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:text-base ${
                tripType === 'solo-ida' ? 'bg-white text-neutral-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Solo ida
            </button>
          </div>
          <p className="text-sm text-white/50">Consulta la disponibilidad real de nuestra flota</p>
        </div>

        <div className="flex flex-1 flex-col items-stretch gap-4 lg:flex-row">
          {/* Origen / Destino combinados en una sola cápsula, con el botón
              de intercambio superpuesto sobre el divisor central. */}
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-white/25 bg-white/[0.07] sm:flex-row lg:h-20">
            <div className="flex flex-1 items-center gap-3 px-5 py-4">
              <PlaneTakeoff className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex-1 text-left">
                <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Origen</label>
                <input
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ciudad o código"
                  className="w-full bg-transparent text-lg font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
                />
              </div>
            </div>

            <div className="hidden w-px bg-white/25 sm:block" />
            <div className="block h-px w-full bg-white/25 sm:hidden" />

            <button
              type="button"
              onClick={handleSwap}
              aria-label="Intercambiar origen y destino"
              className="absolute left-1/2 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-neutral-900 text-white/80 transition-colors hover:text-primary"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div className="flex flex-1 items-center gap-3 px-5 py-4">
              <PlaneLanding className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex-1 text-left">
                <label className="block text-sm font-semibold uppercase tracking-wide text-white/60">Destino</label>
                <input
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ciudad o código"
                  className="w-full bg-transparent text-lg font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
                />
              </div>
            </div>
          </div>

          {/* Salida / Regreso combinados en la misma cápsula; ambos botones
              abren el mismo calendario de dos meses. */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-white/25 bg-white/[0.07] sm:flex-row lg:h-20 lg:w-auto">
            <button
              type="button"
              onClick={() => setDatePickerOpen(true)}
              className="flex flex-1 items-center gap-3 px-5 py-4 text-left lg:min-w-[180px]"
            >
              <CalendarDays className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex-1">
                <span className="block text-sm font-semibold uppercase tracking-wide text-white/60">Salida</span>
                <span className={`block text-lg font-medium ${salida ? 'text-white' : 'text-white/50'}`}>
                  {salida ? formatShortDate(salida) : 'dd/mm/aaaa'}
                </span>
              </div>
            </button>

            {tripType === 'ida-vuelta' && (
              <>
                <div className="hidden w-px bg-white/25 sm:block" />
                <div className="block h-px w-full bg-white/25 sm:hidden" />
                <button
                  type="button"
                  onClick={() => setDatePickerOpen(true)}
                  className="flex flex-1 items-center gap-3 px-5 py-4 text-left lg:min-w-[180px]"
                >
                  <CalendarDays className="h-6 w-6 shrink-0 text-primary" />
                  <div className="flex-1">
                    <span className="block text-sm font-semibold uppercase tracking-wide text-white/60">Regreso</span>
                    <span className={`block text-lg font-medium ${regreso ? 'text-white' : 'text-white/50'}`}>
                      {regreso ? formatShortDate(regreso) : 'dd/mm/aaaa'}
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-auto w-full rounded-xl py-4 text-2xl font-bold text-white lg:h-20 lg:w-auto lg:px-12 lg:text-3xl"
          >
            Buscar
          </Button>
        </div>

        {datePickerOpen && (
          <FlightCalendarPopover
            tripType={tripType}
            salida={salida}
            regreso={regreso}
            onChangeSalida={setSalida}
            onChangeRegreso={setRegreso}
            onClose={() => setDatePickerOpen(false)}
            origenCodigo={origen.trim() ? origen.trim().toUpperCase() : undefined}
            destinoCodigo={destino.trim() ? destino.trim().toUpperCase() : undefined}
          />
        )}
      </form>
    </section>
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
      <div className="mx-auto -mt-8 w-full max-w-[1280px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:min-h-[420px]">
          <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {banner?.titulo || 'Cada vuelo, bajo control'}
            </h2>
            <p className="text-sm text-white/70 sm:text-base">
              {banner?.texto ||
                'Desde el despegue hasta el aterrizaje, sigue cada operación de la flota en tiempo real.'}
            </p>
            <Button asChild size="lg" className="w-fit rounded-full">
              <Link to="/flights">Ver vuelos</Link>
            </Button>
          </div>
          <div className="relative min-h-[280px] sm:min-h-0">
            {hasImage ? (
              <img
                src={banner!.imagenUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setBanner(null)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-neutral-700 to-neutral-900" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Aeropuertos reales sembrados en el backend (ver seed_data.py). Se usan
// como opciones del selector "Ofertas desde [Ciudad]" y como vitrina de
// destinos cuando todavía no hay datos de precio real disponibles.
const REAL_AIRPORTS = [
  { codigo: 'UIO', ciudad: 'Quito', pais: 'Ecuador' },
  { codigo: 'GYE', ciudad: 'Guayaquil', pais: 'Ecuador' },
  { codigo: 'BOG', ciudad: 'Bogotá', pais: 'Colombia' },
  { codigo: 'LIM', ciudad: 'Lima', pais: 'Perú' },
]

const DESTINATION_GRADIENTS = [
  'from-primary/60 to-neutral-900',
  'from-emerald-600/60 to-neutral-900',
  'from-amber-600/60 to-neutral-900',
  'from-fuchsia-600/60 to-neutral-900',
]

/**
 * Tarjeta de destino estilo Avianca: la imagen (o degradado de respaldo)
 * ocupa toda la tarjeta y el texto se superpone abajo sobre un scrim
 * oscuro, en vez de vivir en una barra sólida separada debajo de la foto.
 * Se reutiliza tanto en "Ofertas desde [Ciudad]" como en "Ofertas
 * destacadas" para que ambas secciones compartan el mismo lenguaje visual.
 */
function DestinationCard({
  to,
  ciudad,
  caption,
  precio,
  imageUrl,
  gradient,
}: {
  to: string
  ciudad: string
  caption: string
  precio?: number | null
  imageUrl?: string | null
  gradient: string
}) {
  return (
    <Link
      to={to}
      className="group relative isolate flex h-72 flex-col justify-end overflow-hidden rounded-2xl bg-neutral-800 text-white shadow-sm transition-transform hover:-translate-y-1"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${gradient}`} />
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      <div className="relative flex items-end justify-between gap-3 p-5">
        <div>
          <p className="text-lg font-semibold">{ciudad}</p>
          <p className="text-xs text-white/70">{caption}</p>
        </div>
        {precio != null && <p className="text-lg font-bold text-primary">{formatPrice(precio)}</p>}
      </div>
    </Link>
  )
}

interface DestinationDeal {
  codigo: string
  ciudad: string
  precio: number | null
}

/**
 * "Ofertas desde [Ciudad]": selector de aeropuerto de origen (los 4 reales
 * sembrados en el backend) + hasta 3 tarjetas con el destino y el precio
 * más barato real entre los próximos vuelos de esa ruta (se trae un lote
 * con origenCodigo y se calcula el mínimo por destino en el cliente, igual
 * que en OffersSection, porque la API no soporta ordenar por precio).
 *
 * A diferencia del diseño de Avianca en el que se basa esta sección, no
 * se muestra el badge "Acumula millas" ni un segundo precio en USD: SkyOps
 * no tiene programa de millas ni conversión de moneda en el backend, y
 * agregar esos datos sería inventarlos.
 */
function DestinationOffersSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [origenCodigo, setOrigenCodigo] = useState(REAL_AIRPORTS[2].codigo) // BOG por defecto
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [deals, setDeals] = useState<DestinationDeal[]>([])
  const [hasRealPrices, setHasRealPrices] = useState(false)
  const [loading, setLoading] = useState(true)

  const origenActual = REAL_AIRPORTS.find((a) => a.codigo === origenCodigo) ?? REAL_AIRPORTS[2]
  const otrosDestinos = REAL_AIRPORTS.filter((a) => a.codigo !== origenCodigo)

  useEffect(() => {
    let active = true
    setLoading(true)

    getFlightsUseCase
      .execute({ origenCodigo, ordering: 'salida_programada', limite: 100 })
      .then((result) => {
        if (!active) return

        const cheapestByDestino = new Map<string, Flight>()
        for (const flight of result.resultados) {
          if (flight.destinoCodigo === origenCodigo) continue
          const existing = cheapestByDestino.get(flight.destinoCodigo)
          if (!existing || flight.precioBase < existing.precioBase) {
            cheapestByDestino.set(flight.destinoCodigo, flight)
          }
        }

        const real = Array.from(cheapestByDestino.values())
          .sort((a, b) => a.precioBase - b.precioBase)
          .slice(0, 3)
          .map((flight) => ({ codigo: flight.destinoCodigo, ciudad: flight.destinoCiudad, precio: flight.precioBase }))

        if (real.length > 0) {
          setDeals(real)
          setHasRealPrices(true)
        } else {
          setDeals(otrosDestinos.slice(0, 3).map((d) => ({ codigo: d.codigo, ciudad: d.ciudad, precio: null })))
          setHasRealPrices(false)
        }
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setDeals(otrosDestinos.slice(0, 3).map((d) => ({ codigo: d.codigo, ciudad: d.ciudad, precio: null })))
        setHasRealPrices(false)
        setLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origenCodigo])

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="relative mb-8 flex justify-center">
          <button
            type="button"
            onClick={() => setSelectorOpen((v) => !v)}
            className="flex items-center gap-1.5 text-2xl font-semibold tracking-tight"
          >
            Ofertas desde <span className="text-primary">{origenActual.ciudad}</span>
            <ChevronDown className={`h-5 w-5 text-primary transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
          </button>

          {selectorOpen && (
            <div className="absolute top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border bg-popover shadow-lg">
              {REAL_AIRPORTS.map((airport) => (
                <button
                  key={airport.codigo}
                  type="button"
                  onClick={() => {
                    setOrigenCodigo(airport.codigo)
                    setSelectorOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                    airport.codigo === origenCodigo ? 'font-semibold text-primary' : ''
                  }`}
                >
                  {airport.ciudad}
                  <span className="text-xs text-muted-foreground">{airport.codigo}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {deals.map((deal, i) => (
              <DestinationCard
                key={deal.codigo}
                to={isAuthenticated ? `/flights?origen=${origenCodigo}&destino=${deal.codigo}` : '/login'}
                ciudad={deal.ciudad}
                caption={
                  hasRealPrices
                    ? 'Por trayecto desde'
                    : isAuthenticated
                      ? 'Ver disponibilidad'
                      : 'Inicia sesión para ver precios'
                }
                precio={deal.precio}
                gradient={DESTINATION_GRADIENTS[i % DESTINATION_GRADIENTS.length]}
              />
            ))}
          </div>
        )}
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
    <section className="px-4 py-4 sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">Prepárate para volar</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col justify-between p-6">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold">{feature.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{feature.text}</p>
              </div>
              <Link to={feature.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {feature.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Cierre en dos paneles: pasajeros vs. equipo de operaciones — las dos
 * caras reales de la plataforma, en vez de un beneficio de marca inventado.
 */
function AudienceSection() {
  const { isAuthenticated, user } = useAuthStore()
  const isStaff = isAuthenticated && (user?.esStaff || user?.esOperador)

  return (
    <section className="px-4 pb-20 sm:px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-primary p-8 text-primary-foreground sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">Para pasajeros</p>
            <h3 className="mt-2 text-2xl font-bold">Reserva tu próximo vuelo</h3>
            <p className="mt-2 text-sm text-primary-foreground/85">
              Encuentra el vuelo ideal y confirma tu reserva en pocos pasos.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6 w-fit rounded-full">
              <Link to="/flights">
                Ver vuelos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-800 p-8 text-white sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Para el equipo de operaciones</p>
            <h3 className="mt-2 text-2xl font-bold">Panel de control del aeropuerto</h3>
            <p className="mt-2 text-sm text-white/70">
              Administra vuelos, aeronaves, tripulaciones e incidentes desde un solo panel.
            </p>
            <Button asChild size="lg" className="mt-6 w-fit rounded-full">
              <Link to={isStaff ? '/admin' : '/login'}>
                {isStaff ? (
                  <>
                    <LayoutDashboard className="h-4 w-4" />
                    Ir al panel
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <TopInfoBar />
      <SearchPanel />
      <PromoCard />
      <DestinationOffersSection />
      <FeaturesSection />
      <AudienceSection />
    </div>
  )
}
