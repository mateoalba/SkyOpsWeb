// src/presentation/pages/flights/FlightDetailPage.tsx
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  PlaneTakeoff,
  DoorOpen,
  Plane,
  Users,
  Clock,
  Ticket,
  LogIn,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { Flight } from '@/domain/entities/flight.entity'
import { ApiException } from '@/domain/exceptions/api-exception'
import { getFlightByIdUseCase } from '@/infrastructure/factories/flight.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { BookFlightDialog } from '@/presentation/components/book-flight-dialog'
import { LoginRequiredDialog } from '@/presentation/components/login-required-dialog'
import { FLIGHT_STATUS_VARIANT } from '@/presentation/utils/flight-status-variant'
import { formatFlightDateTime, formatDuration, formatPrice } from '@/presentation/utils/formatters'

function DetailSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 border-b">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  )
}

function DetailError({ error, onRetry }: { error: ApiException; onRetry: () => void }) {
  if (error.isUnauthorized) {
    return (
      <Card className="flex w-full flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Inicia sesión para ver este vuelo</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
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

  if (error.isNotFound) {
    return (
      <Card className="flex w-full flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">No encontramos este vuelo</p>
          <p className="mt-1 text-sm text-muted-foreground">Puede que ya no exista o el enlace esté mal escrito.</p>
        </div>
        <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
          <Link to="/flights">Ver todos los vuelos</Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card className="flex w-full flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-destructive/10">
        <RefreshCw className="h-6 w-6 text-destructive" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">No se pudo cargar el vuelo</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button variant="outline" size="lg" onClick={onRetry} className="w-full rounded-full sm:w-auto">
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </Button>
    </Card>
  )
}

function DetailItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

/**
 * Detalle de un vuelo (GET /vuelos/{id}/). Muestra la misma información que
 * ya expone VueloSerializer: ruta, horarios programados y reales, estado,
 * puerta, aeronave, capacidad, asientos de primera/ejecutiva y precio.
 * El botón "Reservar" reutiliza el mismo BookFlightDialog del listado, para
 * no duplicar la lógica de autoreserva.
 */
export default function FlightDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [flight, setFlight] = useState<Flight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiException | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id) return
    let active = true
    setIsLoading(true)
    setError(null)

    getFlightByIdUseCase
      .execute(id)
      .then((result) => {
        if (active) setFlight(result)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.'))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, reloadKey])

  const handleReservar = () => {
    if (!isAuthenticated) {
      setLoginRequiredOpen(true)
      return
    }
    setBookingOpen(true)
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/flights"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a vuelos
      </Link>

      {isLoading && <DetailSkeleton />}

      {!isLoading && error && <DetailError error={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!isLoading && !error && flight && (
        <>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <PlaneTakeoff className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none">{flight.numeroVuelo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{flight.aerolineaNombre}</p>
                </div>
              </div>
              <Badge variant={FLIGHT_STATUS_VARIANT[flight.estado]}>{flight.estadoDisplay}</Badge>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="text-left">
                  <p className="text-2xl font-bold leading-none sm:text-3xl">{flight.origenCodigo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{flight.origenCiudad}</p>
                  <p className="mt-3 text-sm font-medium">{formatFlightDateTime(flight.salidaProgramada)}</p>
                  {flight.salidaReal && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Real: {formatFlightDateTime(flight.salidaReal)}
                    </p>
                  )}
                </div>

                <div className="relative flex flex-1 items-center justify-center self-start pt-3">
                  <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-muted-foreground/30" />
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card text-primary ring-1 ring-border">
                    <PlaneTakeoff className="h-4 w-4 rotate-45" />
                  </span>
                  {flight.duracionMin != null && (
                    <span className="absolute -bottom-7 whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {formatDuration(flight.duracionMin)}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold leading-none sm:text-3xl">{flight.destinoCodigo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{flight.destinoCiudad}</p>
                  <p className="mt-3 text-sm font-medium">{formatFlightDateTime(flight.llegadaProgramada)}</p>
                  {flight.llegadaReal && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Real: {formatFlightDateTime(flight.llegadaReal)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
                <DetailItem icon={DoorOpen} label="Puerta" value={flight.puertaCodigo ?? 'Sin asignar'} />
                <DetailItem icon={Plane} label="Aeronave" value={flight.aeronaveMatricula ?? 'Sin asignar'} />
                <DetailItem
                  icon={Users}
                  label="Capacidad"
                  value={flight.aeronaveCapacidad != null ? `${flight.aeronaveCapacidad} asientos` : 'No disponible'}
                />
                <DetailItem
                  icon={Clock}
                  label="Duración"
                  value={flight.duracionMin != null ? formatDuration(flight.duracionMin) : 'No disponible'}
                />
              </div>

              {(flight.asientosPrimera || flight.asientosEjecutiva) && (
                <div className="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Primera clase
                    </p>
                    <p className="mt-1 text-sm">{flight.asientosPrimera || 'No disponible'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ejecutiva</p>
                    <p className="mt-1 text-sm">{flight.asientosEjecutiva || 'No disponible'}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Precio por persona (económica)
                  </p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(flight.precioBase)}</p>
                </div>
                <Button size="lg" onClick={handleReservar} className="w-full rounded-full sm:w-auto">
                  <Ticket className="h-4 w-4" />
                  Reservar
                </Button>
              </div>
            </CardContent>
          </Card>

          <BookFlightDialog flight={flight} open={bookingOpen} onOpenChange={setBookingOpen} />
        </>
      )}

      <LoginRequiredDialog
        open={loginRequiredOpen}
        onOpenChange={setLoginRequiredOpen}
        message="Necesitas una cuenta para reservar este vuelo."
      />
    </section>
  )
}
