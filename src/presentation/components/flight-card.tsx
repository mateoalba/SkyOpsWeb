// src/presentation/components/flight-card.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, PlaneTakeoff, Ticket } from 'lucide-react'

import type { Flight } from '@/domain/entities/flight.entity'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Card } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { formatFlightDateTime, formatPrice } from '@/presentation/utils/formatters'
import { FLIGHT_STATUS_VARIANT } from '@/presentation/utils/flight-status-variant'
import { BookFlightDialog } from '@/presentation/components/book-flight-dialog'

interface FlightCardProps {
  flight: Flight
}

/**
 * Tarjeta de vuelo: ícono circular + número/aerolínea arriba, ruta con
 * línea punteada y avión al centro, y una fila inferior con hora y el
 * botón de reservar. El cuerpo (hasta la ruta) enlaza al detalle del vuelo;
 * "Reservar" vive fuera de ese link para no anidar un botón dentro de un
 * <a>, y abre el diálogo de autoreserva (o manda a /login si no hay sesión).
 * En desktop aparece al hacer hover (sm:opacity-0); en móvil, donde no hay
 * hover, se queda siempre visible.
 */
export function FlightCard({ flight }: FlightCardProps) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [bookingOpen, setBookingOpen] = useState(false)

  const handleReservar = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setBookingOpen(true)
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/flights/${flight.id}`} className="block flex-1">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <PlaneTakeoff className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold leading-none">{flight.numeroVuelo}</p>
              <p className="mt-1 text-xs text-muted-foreground">{flight.aerolineaNombre}</p>
            </div>
          </div>
          <Badge variant={FLIGHT_STATUS_VARIANT[flight.estado]}>{flight.estadoDisplay}</Badge>
        </div>

        <div className="mb-4 flex items-center gap-3 px-1">
          <div className="text-left">
            <p className="text-lg font-semibold leading-none">{flight.origenCodigo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{flight.origenCiudad}</p>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-muted-foreground/30" />
            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-card text-primary">
              <PlaneTakeoff className="h-4 w-4 rotate-45" />
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold leading-none">{flight.destinoCodigo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{flight.destinoCiudad}</p>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatFlightDateTime(flight.salidaProgramada)}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{formatPrice(flight.precioBase)}</span>
          <button
            onClick={handleReservar}
            className="flex items-center gap-1 text-sm font-semibold text-primary transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Ticket className="h-3.5 w-3.5" />
            Reservar
          </button>
        </div>
      </div>

      <BookFlightDialog flight={flight} open={bookingOpen} onOpenChange={setBookingOpen} />
    </Card>
  )
}
