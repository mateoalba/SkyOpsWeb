// src/presentation/components/destination-offers-section.tsx
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'

import { useAuthStore } from '@/presentation/store/auth.store'
import {
  useCountryStore,
  COUNTRY_OPTIONS as NAVBAR_COUNTRY_OPTIONS,
  COUNTRY_PRIMARY_CITIES,
} from '@/presentation/store/country.store'
import { getFlightsUseCase } from '@/infrastructure/factories/flight.factory'
import { listAirportsUseCase } from '@/infrastructure/factories/airport.factory'
import type { Flight } from '@/domain/entities/flight.entity'
import type { Airport } from '@/domain/entities/airport.entity'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Button } from '@/presentation/components/ui/button'
import { formatPrice } from '@/presentation/utils/formatters'
import { fetchExchangeRates, formatLocalAmount } from '@/presentation/utils/currency'
import quitoImage from '@/assets/destinations/Quito.webp'
import guayaquilImage from '@/assets/destinations/Guayaquil.webp'
import bogotaImage from '@/assets/destinations/Bogota.webp'
import limaImage from '@/assets/destinations/Lima.webp'

const DESTINATION_GRADIENTS = [
  'from-primary/60 to-neutral-900',
  'from-emerald-600/60 to-neutral-900',
  'from-amber-600/60 to-neutral-900',
  'from-fuchsia-600/60 to-neutral-900',
]

// Fotos de respaldo por ciudad (subidas al repo), para cuando el aeropuerto
// todavía no tiene una foto real cargada desde /admin/aeropuertos. Si el
// admin sube una foto real, esa tiene prioridad (ver imageUrl más abajo).
const DESTINATION_IMAGES: Record<string, string> = {
  UIO: quitoImage,
  GYE: guayaquilImage,
  BOG: bogotaImage,
  LIM: limaImage,
}

/**
 * Tarjeta de destino estilo Avianca: la imagen (o degradado de respaldo)
 * ocupa toda la tarjeta y el texto se superpone abajo sobre un scrim
 * oscuro, en vez de vivir en una barra sólida separada debajo de la foto.
 *
 * El badge de la esquina superior (Nacional/Internacional) sale de comparar
 * el país real del aeropuerto de origen y destino (tabla Aeropuertos), y el
 * precio en moneda local (segunda línea, más chica) se calcula con una tasa
 * de cambio en vivo — si esa tasa no está disponible (ver `currency.ts`),
 * simplemente no se muestra la segunda línea, nunca se inventa un valor.
 */
function DestinationCard({
  to,
  ciudad,
  caption,
  precio,
  precioLocal,
  badge,
  imageUrl,
  gradient,
}: {
  to: string
  ciudad: string
  caption: string
  precio?: number | null
  precioLocal?: string | null
  badge?: string | null
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

      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {badge}
        </span>
      )}

      <div className="relative flex items-end justify-between gap-3 p-5">
        <div>
          <p className="text-lg font-semibold">{ciudad}</p>
          <p className="text-xs text-white/70">{caption}</p>
        </div>
        {precio != null && (
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{precioLocal ?? formatPrice(precio)}</p>
            {precioLocal && <p className="text-xs text-white/60">{formatPrice(precio)}</p>}
          </div>
        )}
      </div>
    </Link>
  )
}

/**
 * Versión compacta de DestinationCard para la fila de "más destinos" debajo
 * de las 3 tarjetas grandes: foto cuadrada a la izquierda + ciudad, badge y
 * precio a la derecha, en una fila horizontal (en vez de la foto a página
 * completa con el texto superpuesto). Mismos datos reales, solo cambia la
 * presentación para que la sección tenga dos niveles como en un buscador de
 * aerolínea comercial.
 */
function DestinationListCard({
  to,
  ciudad,
  caption,
  precio,
  precioLocal,
  badge,
  imageUrl,
  gradient,
}: {
  to: string
  ciudad: string
  caption: string
  precio?: number | null
  precioLocal?: string | null
  badge?: string | null
  imageUrl?: string | null
  gradient: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-neutral-900/60 pr-4 transition-colors hover:border-primary/40"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}
      </div>

      <div className="flex flex-1 items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{ciudad}</p>
          <p className="text-xs text-white/60">{caption}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {badge && (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-primary">{badge}</span>
          )}
          {precio != null && (
            <span className="text-sm font-bold text-primary">{precioLocal ?? formatPrice(precio)}</span>
          )}
          <ChevronRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

/**
 * Elige el aeropuerto "principal" de un país dentro del catálogo real: la
 * primera ciudad de COUNTRY_PRIMARY_CITIES que exista ahí (p. ej. Quito
 * antes que Baltra en Ecuador), o si ninguna existe todavía, el primer
 * aeropuerto de ese país que haya (nunca deja el selector sin nada si el
 * país sí tiene aeropuertos, solo si no tiene ninguno todavía).
 */
function pickPrimaryAirport(countryCode: string | null, countryName: string | null, airports: Airport[]): Airport | null {
  if (!countryName) return null
  const preferred = countryCode ? COUNTRY_PRIMARY_CITIES[countryCode] ?? [] : []
  for (const city of preferred) {
    const match = airports.find((a) => a.pais === countryName && a.ciudad === city)
    if (match) return match
  }
  return airports.find((a) => a.pais === countryName) ?? null
}

interface DestinationDeal {
  codigo: string
  ciudad: string
  pais: string
  precio: number | null
  fotoUrl: string | null
}

interface DestinationOffersSectionProps {
  className?: string
  /** Cuántos destinos extra (además de los principales) mostrar en la fila
   * compacta de abajo. En modo `paginated` es el tamaño de cada tanda (8 en
   * /flights); si no, es un corte fijo sin botón (4 en el Home, 2x2). */
  extraLimit?: number
  /** Si es `true`, la fila compacta de abajo empieza mostrando solo
   * `extraLimit` destinos y agrega un botón "Ver más" que revela otra tanda
   * del mismo tamaño cada vez (usado en /flights). Si es `false` (default),
   * se corta en `extraLimit` sin botón, como ya hacía el Home. */
  paginated?: boolean
  /** Código IATA de origen con el que arranca el selector "Ofertas desde"
   * (p. ej. viniendo de un link `?origen=UIO`). Si no se pasa, se usa BOG
   * o el primer aeropuerto disponible, igual que antes. */
  initialOrigenCodigo?: string | null
}

/**
 * Carrusel infinito: la fila de tarjetas se duplica una sola vez y se anima
 * con `animate-marquee` (ver index.css), que desliza el 50% del ancho total
 * — como la segunda mitad es idéntica a la primera, el loop no se nota. Se
 * pausa al pasar el mouse para poder leer o hacer clic en una tarjeta sin
 * que se mueva. `itemWidthClass` fija el ancho de cada tarjeta (deben ser
 * anchos fijos, no porcentuales, para que la duplicación funcione).
 */
function MarqueeRow({ children, itemWidthClass }: { children: ReactNode[]; itemWidthClass: string }) {
  if (children.length === 0) return null
  // El truco del loop sin corte: la pista completa son DOS mitades
  // idénticas, y la animación desliza exactamente -50% (una mitad) — así el
  // salto de vuelta a 0% cae sobre una copia igual. Con pocas tarjetas una
  // sola mitad se vería muy corta/vacía, así que cada mitad repite el set
  // las veces que haga falta para lucir llena.
  const repeatsPerHalf = Math.max(1, Math.ceil(3 / children.length))
  const half = Array.from({ length: repeatsPerHalf }, () => children).flat()
  const track = [...half, ...half]

  return (
    <div className="group overflow-hidden">
      <div className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused]">
        {track.map((child, i) => (
          <div key={i} className={`shrink-0 ${itemWidthClass}`}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * "Ofertas desde [Ciudad]": selector de aeropuerto de origen + 3 tarjetas
 * grandes con el destino y el precio más barato real entre los próximos
 * vuelos de esa ruta, y debajo una fila de destinos adicionales en formato
 * compacto (se trae un lote con origenCodigo y se calcula el mínimo por
 * destino en el cliente, porque la API no soporta ordenar por precio).
 *
 * Tanto el selector como las tarjetas se conectan con la tabla real de
 * Aeropuertos (GET /aeropuertos/, pública) en vez de una lista fija en el
 * frontend — así cualquier aeropuerto que un admin agregue desde el panel
 * aparece automáticamente aquí. De cada aeropuerto solo se muestra la
 * ciudad (igual que antes); el país real se usa para el badge
 * Nacional/Internacional y para elegir la moneda local del precio, pero
 * nunca se expone el nombre completo del aeropuerto.
 *
 * Componente compartido entre el Home y la pantalla de Vuelos, para que
 * ambas pantallas muestren exactamente la misma sección de ofertas.
 */
export function DestinationOffersSection({
  className,
  extraLimit = 4,
  paginated = false,
  initialOrigenCodigo,
}: DestinationOffersSectionProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const countryCode = useCountryStore((state) => state.countryCode)
  const [airports, setAirports] = useState<Airport[]>([])
  const [origenCodigo, setOrigenCodigo] = useState<string | null>(null)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [deals, setDeals] = useState<DestinationDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleExtra, setVisibleExtra] = useState(extraLimit)
  const [rates, setRates] = useState<Record<string, number>>({})

  // País elegido en el selector de ubicación del navbar (nombre real, p. ej.
  // "Ecuador"), para poder comparar contra `deal.pais` (que viene de la
  // tabla Aeropuertos) y separar destinos nacionales de internacionales.
  const selectedCountryName = NAVBAR_COUNTRY_OPTIONS.find((c) => c.code === countryCode)?.name ?? null

  // Catálogo real de aeropuertos (una sola vez) + tasas de cambio en vivo
  // (una sola vez, cacheadas a nivel de módulo en currency.ts). El origen
  // por defecto prioriza la ciudad "principal" del país ya elegido en el
  // navbar (p. ej. Quito en Ecuador, ver COUNTRY_PRIMARY_CITIES) para que
  // "Ofertas desde" arranque en la ciudad obvia de ese país, en vez de
  // simplemente la primera en orden alfabético del catálogo.
  useEffect(() => {
    listAirportsUseCase
      .execute()
      .then((result) => {
        setAirports(result)
        setOrigenCodigo(
          (prev) =>
            prev ??
            initialOrigenCodigo ??
            pickPrimaryAirport(countryCode, selectedCountryName, result)?.codigoIata ??
            result.find((a) => a.codigoIata === 'BOG')?.codigoIata ??
            result[0]?.codigoIata ??
            null,
        )
      })
      .catch(() => setAirports([]))

    fetchExchangeRates().then(setRates)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cuando el visitante cambia de país en el selector del navbar (no en el
  // primer render, ese caso ya lo cubre el efecto de arriba), re-ubicamos
  // "Ofertas desde" en la ciudad principal de ese país si el origen actual
  // ya no pertenece a él — así seleccionar Argentina, por ejemplo, mueve el
  // origen a Buenos Aires en vez de dejarlo en uno de otro país.
  const isFirstCountrySync = useRef(true)
  useEffect(() => {
    if (isFirstCountrySync.current) {
      isFirstCountrySync.current = false
      return
    }
    if (!selectedCountryName || airports.length === 0) return

    setOrigenCodigo((prev) => {
      const prevAirport = airports.find((a) => a.codigoIata === prev)
      if (prevAirport?.pais === selectedCountryName) return prev
      const match = pickPrimaryAirport(countryCode, selectedCountryName, airports)
      return match?.codigoIata ?? prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryName])

  const origenActual = airports.find((a) => a.codigoIata === origenCodigo) ?? null
  const otrosDestinos = airports.filter((a) => a.codigoIata !== origenCodigo)

  // Al cambiar de origen la lista de "más destinos" es otra, así que el
  // "Ver más" vuelve a arrancar mostrando solo la primera tanda.
  useEffect(() => {
    setVisibleExtra(extraLimit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origenCodigo])

  useEffect(() => {
    if (!origenCodigo) return
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

        // Primero los destinos con vuelo real (ordenados del más barato al
        // más caro); luego el resto de aeropuertos del catálogo que todavía
        // no tienen un vuelo programado desde este origen, sin precio (se
        // muestran igual como destino navegable, nunca se inventa un precio
        // para ellos) — así la sección muestra TODOS los destinos
        // disponibles, no solo los que ya tienen vuelo cargado.
        const real = Array.from(cheapestByDestino.values())
          .sort((a, b) => a.precioBase - b.precioBase)
          .map((flight) => {
            const aeropuerto = airports.find((a) => a.codigoIata === flight.destinoCodigo)
            return {
              codigo: flight.destinoCodigo,
              ciudad: flight.destinoCiudad,
              pais: aeropuerto?.pais ?? '',
              precio: flight.precioBase,
              fotoUrl: aeropuerto?.fotoUrl ?? null,
            }
          })

        const codigosConVuelo = new Set(real.map((d) => d.codigo))
        const resto = otrosDestinos
          .filter((d) => !codigosConVuelo.has(d.codigoIata))
          .map((d) => ({ codigo: d.codigoIata, ciudad: d.ciudad, pais: d.pais, precio: null, fotoUrl: d.fotoUrl }))

        // No se corta a totalLimit aquí: la separación nacional/internacional
        // (ver más abajo, en el render) necesita ver el catálogo completo
        // para poder llenar las 3 tarjetas grandes solo con destinos del país
        // elegido en el selector del navbar, antes de decidir cuántas quedan
        // para la fila compacta de abajo.
        setDeals([...real, ...resto])
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setDeals(
          otrosDestinos.map((d) => ({ codigo: d.codigoIata, ciudad: d.ciudad, pais: d.pais, precio: null, fotoUrl: d.fotoUrl })),
        )
        setLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origenCodigo, airports])

  if (!loading && airports.length === 0) return null

  // Separación nacional/internacional según el país elegido en el selector
  // de ubicación del navbar: el carrusel de arriba muestra SOLO destinos del
  // mismo país (p. ej. si el navbar está en Ecuador, ahí solo aparecen otros
  // aeropuertos ecuatorianos, dando vueltas en loop); los internacionales
  // (Bogotá, Miami...) bajan a la fila compacta de abajo. Si el país
  // elegido no tiene ningún otro destino en el catálogo (nacionales vacío),
  // no forzamos la separación y se muestra todo mezclado como antes, para
  // no dejar la sección vacía arriba.
  const nacionales = selectedCountryName ? deals.filter((d) => d.pais === selectedCountryName) : []
  const internacionales = selectedCountryName ? deals.filter((d) => d.pais !== selectedCountryName) : deals
  const hasNacionales = nacionales.length > 0

  const topDeals = hasNacionales ? nacionales : deals.slice(0, 3)
  const bottomPool = hasNacionales ? internacionales : deals.slice(3)
  const bottomDeals = bottomPool.slice(0, paginated ? visibleExtra : extraLimit)
  const hasMoreBottom = paginated && bottomPool.length > visibleExtra

  // País de referencia para el badge Nacional/Internacional: el elegido en
  // el navbar si hay uno, si no el país del aeropuerto de origen (como antes).
  const referenceCountry = selectedCountryName ?? origenActual?.pais ?? null

  // El selector de ciudad de origen ("Ofertas desde") solo debe ofrecer
  // ciudades del país ya elegido en el navbar — así no se puede terminar con
  // el origen en un país distinto al seleccionado (lo que generaba la
  // combinación rara "Ofertas desde Miami" con badges "Nacional" pensados
  // para otro país). Si ese país no tiene ningún aeropuerto en el catálogo
  // todavía, se muestra el catálogo completo para no dejar el selector vacío.
  const originSelectorAirports = selectedCountryName
    ? airports.filter((a) => a.pais === selectedCountryName)
    : airports
  const originAirports = originSelectorAirports.length > 0 ? originSelectorAirports : airports

  return (
    <div className={className}>
      <div className="relative mb-8 flex justify-center">
        <button
          type="button"
          onClick={() => setSelectorOpen((v) => !v)}
          className="flex items-center gap-1.5 text-2xl font-semibold tracking-tight"
        >
          Ofertas desde{' '}
          <span className="text-primary">
            {(referenceCountry ?? origenActual?.pais) && `${referenceCountry ?? origenActual?.pais} - `}
            {origenActual?.ciudad ?? '...'}
          </span>
          <ChevronDown className={`h-5 w-5 text-primary transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
        </button>

        {selectorOpen && (
          <div className="absolute top-full z-20 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border bg-popover shadow-lg">
            {originAirports.map((airport) => {
              const selected = airport.codigoIata === origenCodigo
              return (
                <button
                  key={airport.codigoIata}
                  type="button"
                  onClick={() => {
                    setOrigenCodigo(airport.codigoIata)
                    setSelectorOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                    selected ? 'font-semibold text-primary' : ''
                  }`}
                >
                  {airport.ciudad}
                  {selected && <Check className="h-4 w-4 text-primary" />}
                </button>
              )
            })}
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
        <>
          <MarqueeRow itemWidthClass="w-[85vw] sm:w-80">
            {topDeals.map((deal, i) => (
              <DestinationCard
                key={deal.codigo}
                to={isAuthenticated ? `/flights?origen=${origenCodigo}&destino=${deal.codigo}` : '/login'}
                ciudad={deal.ciudad}
                caption={
                  deal.precio != null
                    ? 'Por trayecto desde'
                    : isAuthenticated
                      ? 'Ver disponibilidad'
                      : 'Inicia sesión para ver precios'
                }
                precio={deal.precio}
                precioLocal={deal.precio != null && deal.pais ? formatLocalAmount(deal.precio, deal.pais, rates) : null}
                imageUrl={deal.fotoUrl ?? DESTINATION_IMAGES[deal.codigo] ?? null}
                badge={deal.pais && referenceCountry ? (deal.pais === referenceCountry ? 'Nacional' : 'Internacional') : null}
                gradient={DESTINATION_GRADIENTS[i % DESTINATION_GRADIENTS.length]}
              />
            ))}
          </MarqueeRow>

          {bottomDeals.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {bottomDeals.map((deal, i) => (
                <DestinationListCard
                  key={deal.codigo}
                  to={isAuthenticated ? `/flights?origen=${origenCodigo}&destino=${deal.codigo}` : '/login'}
                  ciudad={deal.ciudad}
                  caption={
                    deal.precio != null
                      ? 'Por trayecto desde'
                      : isAuthenticated
                        ? 'Ver disponibilidad'
                        : 'Inicia sesión para ver precios'
                  }
                  precio={deal.precio}
                  precioLocal={
                    deal.precio != null && deal.pais ? formatLocalAmount(deal.precio, deal.pais, rates) : null
                  }
                  imageUrl={deal.fotoUrl ?? DESTINATION_IMAGES[deal.codigo] ?? null}
                  badge={deal.pais && referenceCountry ? (deal.pais === referenceCountry ? 'Nacional' : 'Internacional') : null}
                  gradient={DESTINATION_GRADIENTS[i % DESTINATION_GRADIENTS.length]}
                />
              ))}
            </div>
          )}

          {hasMoreBottom && (
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-12 py-7 text-lg"
                onClick={() => setVisibleExtra((v) => v + extraLimit)}
              >
                Ver más
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
