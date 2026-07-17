// src/presentation/pages/reservations/MyReservationsPage.tsx
import { useEffect, useState } from 'react'
import { RefreshCw, Ticket } from 'lucide-react'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { ApiException } from '@/domain/exceptions/api-exception'
import {
  getAdminResourceListUseCase,
  updateAdminResourceUseCase,
} from '@/infrastructure/factories/admin-resource.factory'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Pagination } from '@/presentation/components/pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { formatFlightDateTime, formatPrice } from '@/presentation/utils/formatters'

const ESTADO_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  confirmada: 'default',
  pendiente: 'secondary',
  abordada: 'outline',
  cancelada: 'destructive',
}

function estadoVariant(estado: unknown) {
  return ESTADO_VARIANT[String(estado ?? '')] ?? 'secondary'
}

export default function MyReservationsPage() {
  const [rows, setRows] = useState<AdminRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiException | null>(null)

  const [reservaToCancel, setReservaToCancel] = useState<AdminRecord | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const load = async (page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAdminResourceListUseCase.execute('/reservas/', { page })
      setRows(result.resultados)
      setTotal(result.total)
      setTotalPages(result.paginas)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.'))
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  const confirmCancel = async () => {
    if (!reservaToCancel) return
    setIsCancelling(true)
    try {
      await updateAdminResourceUseCase.execute('/reservas/', String(reservaToCancel.id), { estado: 'cancelada' })
      setReservaToCancel(null)
      load(currentPage)
    } catch (err) {
      setError(err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.'))
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Mis reservas</h1>
        <p className="text-sm text-muted-foreground">Vuelos que has reservado con tu cuenta.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <p className="font-medium">No se pudieron cargar tus reservas</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" onClick={() => load(currentPage)}>
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Ticket className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Todavía no tienes reservas. Ve a Vuelos y reserva uno.</p>
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <>
          <div className="space-y-3">
            {rows.map((r, i) => {
              const puedeCancel = r.estado === 'confirmada' || r.estado === 'pendiente'
              return (
                <Card key={(r.id as string) ?? i}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                    <div>
                      <p className="text-xs text-muted-foreground">{String(r.codigo_reserva ?? '')}</p>
                      <p className="font-semibold">
                        {String(r.vuelo_numero ?? '')} · {String(r.vuelo_origen ?? '')} → {String(r.vuelo_destino ?? '')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFlightDateTime(String(r.reservado_en ?? ''))} · {String(r.clase_display ?? '')} · Asiento{' '}
                        {String(r.numero_asiento ?? '—')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{formatPrice(Number(r.precio ?? 0))}</p>
                      <Badge variant={estadoVariant(r.estado)}>{String(r.estado_display ?? '')}</Badge>
                      {puedeCancel && (
                        <Button variant="outline" size="sm" onClick={() => setReservaToCancel(r)}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            itemLabel="reservas"
            onChange={load}
          />
        </>
      )}

      <AlertDialog open={reservaToCancel !== null} onOpenChange={(open) => !open && setReservaToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cambiará el estado de tu reserva a cancelada. No se puede deshacer desde aquí.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
