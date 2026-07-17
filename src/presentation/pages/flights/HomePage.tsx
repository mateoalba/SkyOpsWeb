// src/presentation/pages/flights/HomePage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  ArrowRight,
  ArrowLeftRight,
  LogIn,
  RefreshCw,
  Search,
  Info,
  X,
  Ticket,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react'

import { useFlightsStore } from '@/presentation/store/flights.store'
import { useAuthStore } from '@/presentation/store/auth.store'
import { getFlightsUseCase } from '@/infrastructure/factories/flight.factory'
import type { Flight } from '@/domain/entities/flight.entity'
import type { PromoBanner } from '@/domain/entities/promo-banner.entity'
import { getBannerUseCase } from '@/infrastructure/factories/banner.factory'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { FlightCard } from '@/presentation/components/flight-card'
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
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center text-white">
        <PlaneTakeoff className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Control total en cada despegue</h1>
        <p className="max-w-xl text-balance text-sm text-white/70 sm:text-base">
          Monitoreo de precisión para la aviación moderna: horarios, estados y rutas en tiempo real.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="relative mx-auto mt-8 w-full max-w-6xl rounded-2xl border border-white/10 bg-neutral-900 p-4 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full bg-white/10 p-1">
            <button
              type="button"
              onClick={() => setTripType('ida-vuelta')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                tripType === 'ida-vuelta' ? 'bg-white text-neutral-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Ida y vuelta
            </button>
            <button
              type="button"
              onClick={() => setTripType('solo-ida')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                tripType === 'solo-ida' ? 'bg-white text-neutral-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Solo ida
            </button>
          </div>
          <p className="text-xs text-white/50">Consulta la disponibilidad real de nuestra flota</p>
        </div>

        <div className="flex flex-col items-stretch gap-3 lg:flex-row">
          {/* Origen / Destino combinados en una sola cápsula, con el botón
              de intercambio superpuesto sobre el divisor central. */}
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-white/25 bg-white/[0.07] sm:flex-row lg:h-16">
            <div className="flex flex-1 items-center gap-2 px-4 py-3">
              <PlaneTakeoff className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Origen</label>
                <input
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ciudad o código"
                  className="w-full bg-transparent text-base font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
                />
              </div>
            </div>

            <div className="hidden w-px bg-white/25 sm:block" />
            <div className="block h-px w-full bg-white/25 sm:hidden" />

            <button
              type="button"
              onClick={handleSwap}
              aria-label="Intercambiar origen y destino"
              className="absolute left-1/2 top-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-neutral-900 text-white/80 transition-colors hover:text-primary"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>

            <div className="flex flex-1 items-center gap-2 px-4 py-3">
              <PlaneLanding className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">Destino</label>
                <input
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ciudad o código"
                  className="w-full bg-transparent text-base font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
                />
              </div>
            </div>
          </div>

          {/* Salida / Regreso combinados en la misma cápsula; ambos botones
              abren el mismo calendario de dos meses. */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-white/25 bg-white/[0.07] sm:flex-row lg:h-16 lg:w-auto">
            <button
              type="button"
              onClick={() => setDatePickerOpen(true)}
              className="flex flex-1 items-center gap-2 px-4 py-3 text-left lg:min-w-[160px]"
            >
              <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wide text-white/60">Salida</span>
                <span className={`block text-base font-medium ${salida ? 'text-white' : 'text-white/50'}`}>
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
                  className="flex flex-1 items-center gap-2 px-4 py-3 text-left lg:min-w-[160px]"
                >
                  <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
                  <div className="flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-white/60">Regreso</span>
                    <span className={`block text-base font-medium ${regreso ? 'text-white' : 'text-white/50'}`}>
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
            className="h-auto w-full rounded-xl py-3 text-base font-semibold lg:h-16 lg:w-auto lg:px-10 lg:text-lg"
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
 */
function PromoCard() {
  const [banner, setBanner] = useState<PromoBanner | null>(null)

  useEffect(() => {
    getBannerUseCase.execute('dashboard').then(setBanner).catch(() => setBanner(null))
  }, [])

  const hasImage = Boolean(banner?.imagenUrl)

  return (
    <section className="mx-auto -mt-8 w-full max-w-6xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-neutral-900">
        <div className="grid grid-cols-1 sm:grid-cols-2">
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
          <div className="relative min-h-[220px] sm:min-h-0">
            {hasImage ? (
              <img
                src={banner!.imagenUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setBanner(null)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-neutral-800 to-neutral-950" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

interface OfferCard {
  banner: PromoBanner | null
  flight: Flight
}

// Aeropuertos reales sembrados en el backend (ver seed_data.py) — se usan
// como vitrina de destinos cuando todavía no hay ofertas con precio real
// (por ejemplo, si el visitante no inició sesión y /vuelos/ responde 401,
// ya que ese endpoint exige autenticación incluso para leer).
const FALLBACK_DESTINATIONS = [
  { codigo: 'UIO', ciudad: 'Quito', pais: 'Ecuador' },
  { codigo: 'GYE', ciudad: 'Guayaquil', pais: 'Ecuador' },
  { codigo: 'BOG', ciudad: 'Bogotá', pais: 'Colombia' },
  { codigo: 'LIM', ciudad: 'Lima', pais: 'Perú' },
]

const FALLBACK_GRADIENTS = [
  'from-primary/50 to-neutral-800',
  'from-emerald-500/40 to-neutral-800',
  'from-amber-500/40 to-neutral-800',
  'from-fuchsia-500/40 to-neutral-800',
]

/**
 * "Ofertas destacadas": combina las imágenes configurables de los banners
 * oferta_1/2/3 con los 3 vuelos más económicos de entre los próximos
 * (la API de vuelos no soporta ordenar por precio, así que se trae un lote
 * y se ordena/deduplica por destino en el cliente). Si no hay datos reales
 * (por ejemplo, sin sesión iniciada) se muestra una vitrina de los
 * destinos reales del proyecto en vez de dejar la sección vacía.
 */
function OffersSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [offers, setOffers] = useState<OfferCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      Promise.all(['oferta_1', 'oferta_2', 'oferta_3'].map((clave) => getBannerUseCase.execute(clave).catch(() => null))),
      getFlightsUseCase.execute({ ordering: 'salida_programada', limite: 30 }).catch(() => null),
    ]).then(([banners, result]) => {
      if (!active) return

      const cheapestByDestino = new Map<string, Flight>()
      for (const flight of result?.resultados ?? []) {
        const existing = cheapestByDestino.get(flight.destinoCodigo)
        if (!existing || flight.precioBase < existing.precioBase) {
          cheapestByDestino.set(flight.destinoCodigo, flight)
        }
      }
      const cheapest = Array.from(cheapestByDestino.values())
        .sort((a, b) => a.precioBase - b.precioBase)
        .slice(0, 3)

      setOffers(cheapest.map((flight, i) => ({ flight, banner: banners[i] ?? null })))
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const hasRealOffers = offers.length > 0

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        {hasRealOffers ? 'Ofertas destacadas' : 'Destinos disponibles'}
      </h2>
      <p className="mb-8 text-sm text-muted-foreground">
        {hasRealOffers
          ? 'Los precios más bajos entre los próximos vuelos'
          : isAuthenticated
            ? 'Explora las rutas activas de la flota'
            : 'Inicia sesión para ver precios y disponibilidad en tiempo real'}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : hasRealOffers ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {offers.map(({ banner, flight }) => (
            <Link
              key={flight.id}
              to={`/flights?destino=${flight.destinoCodigo}`}
              className="group overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="relative h-40 w-full overflow-hidden">
                {banner?.imagenUrl ? (
                  <img
                    src={banner.imagenUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/50 to-neutral-800" />
                )}
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{flight.destinoCiudad}</p>
                  <p className="text-xs text-white/60">Por trayecto desde</p>
                </div>
                <p className="text-lg font-bold text-primary">{formatPrice(flight.precioBase)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FALLBACK_DESTINATIONS.map((destino, i) => (
            <Link
              key={destino.codigo}
              to={isAuthenticated ? `/flights?destino=${destino.codigo}` : '/login'}
              className="group overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <div className={`h-full w-full bg-gradient-to-br ${FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}`} />
              </div>
              <div className="p-4">
                <p className="font-semibold">{destino.ciudad}</p>
                <p className="text-xs text-white/60">{destino.pais}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {isAuthenticated ? 'Ver vuelos' : 'Inicia sesión para ver precios'}
                  <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
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
    <section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
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
    </section>
  )
}

/**
 * Cierre en dos paneles: pasajeros vs. equipo de operaciones — las dos
 * caras reales de la plataforma, en vez de un beneficio de marca inventado.
 */
function AudienceSection() {
  const { isAuthenticated, user } = useAuthStore()
  const isStaff = isAuthenticated && user?.esStaff

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
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

        <div className="rounded-2xl bg-neutral-900 p-8 text-white sm:p-10">
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
    </section>
  )
}

function FlightsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FlightsError({ status, message, onRetry }: { status: number; message: string; onRetry: () => void }) {
  if (status === 401) {
    return (
      <Card className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Inicia sesión para ver los vuelos</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
          <Link to="/login">
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-destructive/10">
        <RefreshCw className="h-6 w-6 text-destructive" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">No se pudieron cargar los vuelos</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="lg" onClick={onRetry} className="w-full rounded-full sm:w-auto">
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </Button>
    </Card>
  )
}

export default function HomePage() {
  const { flights, isLoading, error, fetchFlights } = useFlightsStore()

  useEffect(() => {
    fetchFlights({ ordering: 'salida_programada' })
  }, [fetchFlights])

  return (
    <div className="flex flex-col">
      <TopInfoBar />
      <SearchPanel />
      <PromoCard />
      <OffersSection />

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Vuelos próximos</h2>
            <p className="text-sm text-muted-foreground">Monitoreo en tiempo real de la flota activa</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Actualizar"
            onClick={() => fetchFlights({ ordering: 'salida_programada' })}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {isLoading && <FlightsSkeleton />}

        {!isLoading && error && (
          <FlightsError
            status={error.status}
            message={error.message}
            onRetry={() => fetchFlights({ ordering: 'salida_programada' })}
          />
        )}

        {!isLoading && !error && flights.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No hay vuelos programados por el momento.</p>
        )}

        {!isLoading && !error && flights.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flights.slice(0, 6).map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" asChild className="rounded-full">
            <Link to="/flights">
              Ver todos los vuelos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <FeaturesSection />
      <AudienceSection />
    </div>
  )
}
