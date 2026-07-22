// src/presentation/components/flight-card.tsx
import { useState } from 'react'
import { PlaneTakeoff } from 'lucide-react'

import type { Flight } from '@/domain/entities/flight.entity'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Badge } from '@/presentation/components/ui/badge'
import { formatDate, formatPrice, formatTime } from '@/presentation/utils/formatters'
import { FLIGHT_STATUS_VARIANT } from '@/presentation/utils/flight-status-variant'
import { BookFlightDialog } from '@/presentation/components/book-flight-dialog'
import { LoginRequiredDialog } from '@/presentation/components/login-required-dialog'
import quitoImage from '@/assets/destinations/Quito.webp'
import guayaquilImage from '@/assets/destinations/Guayaquil.webp'
import bogotaImage from '@/assets/destinations/Bogota.webp'
import limaImage from '@/assets/destinations/Lima.webp'

// Fotos de respaldo por ciudad (mismas que usa "Ofertas desde"), para cuando
// el aeropuerto todavía no tiene una foto real cargada desde /admin/aeropuertos.
const CITY_IMAGES: Record<string, string> = {
  UIO: quitoImage,
  GYE: guayaquilImage,
  BOG: bogotaImage,
  LIM: limaImage,
}

interface FlightCardProps {
  flight: Flight
  /** Foto real del aeropuerto de origen/destino (tabla Aeropuertos), si quien
   * usa la tarjeta ya la tiene cargada. Si no llega, se cae a CITY_IMAGES por
   * código y, si tampoco hay, a un degradado — nunca se inventa una foto. */
  origenFotoUrl?: string | null
  destinoFotoUrl?: string | null
}

/**
 * Tarjeta de vuelo encontrado: la foto de la ciudad de origen ocupa la
 * esquina izquierda y la de destino la derecha (a página completa, con el
 * código + ciudad superpuestos abajo), y en el centro va el resto de la
 * información (aerolínea, número de vuelo, estado, hora y precio) — así se
 * ve la ruta real de un vistazo, en vez de solo texto plano.
 *
 * Toda la tarjeta es un solo botón: al hacer clic va directo a reservar (o
 * pide iniciar sesión si no hay cuenta todavía), sin pasar por una página de
 * detalle intermedia.
 */
export function FlightCard({ flight, origenFotoUrl, destinoFotoUrl }: FlightCardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false)

  const handleReservar = () => {
    if (!isAuthenticated) {
      setLoginRequiredOpen(true)
      return
    }
    setBookingOpen(true)
  }

  const origenImg = origenFotoUrl ?? CITY_IMAGES[flight.origenCodigo] ?? null
  const destinoImg = destinoFotoUrl ?? CITY_IMAGES[flight.destinoCodigo] ?? null

  return (
    <>
      <button
        type="button"
        onClick={handleReservar}
        className="group grid h-52 w-full grid-cols-[1fr_1.5fr_1fr] overflow-hidden rounded-2xl border text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      >
        {/* Esquina de origen */}
        <div className="relative">
          {origenImg ? (
            <img
              src={origenImg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-neutral-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-lg font-bold leading-none">{flight.origenCodigo}</p>
            <p className="mt-1 text-xs text-white/80">{flight.origenCiudad}</p>
          </div>
        </div>

        {/* Centro: información del vuelo */}
        <div className="flex flex-col justify-between bg-card px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold leading-none">{flight.numeroVuelo}</p>
              <p className="mt-1 text-xs text-muted-foreground">{flight.aerolineaNombre}</p>
            </div>
            <Badge variant={FLIGHT_STATUS_VARIANT[flight.estado]}>{flight.estadoDisplay}</Badge>
          </div>

          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-muted-foreground/30" />
            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-card text-primary">
              <PlaneTakeoff className="h-4 w-4 rotate-45" />
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="text-left">
              <p className="text-lg font-semibold text-foreground">{formatTime(flight.salidaProgramada)}</p>
              <p>Salida</p>
            </div>
            <p>{formatDate(flight.salidaProgramada)}</p>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">{formatTime(flight.llegadaProgramada)}</p>
              <p>Llegada</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center text-xl font-bold text-primary">
            {formatPrice(flight.precioBase)}
          </div>
        </div>

        {/* Esquina de destino */}
        <div className="relative">
          {destinoImg ? (
            <img
              src={destinoImg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/50 to-neutral-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute bottom-3 right-3 text-right text-white">
            <p className="text-lg font-bold leading-none">{flight.destinoCodigo}</p>
            <p className="mt-1 text-xs text-white/80">{flight.destinoCiudad}</p>
          </div>
        </div>
      </button>

      <BookFlightDialog flight={flight} open={bookingOpen} onOpenChange={setBookingOpen} />
      <LoginRequiredDialog
        open={loginRequiredOpen}
        onOpenChange={setLoginRequiredOpen}
        message="Necesitas una cuenta para reservar este vuelo."
      />
    </>
  )
}
