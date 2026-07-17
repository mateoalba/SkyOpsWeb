// src/presentation/components/book-flight-dialog.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'

import type { Flight } from '@/domain/entities/flight.entity'
import { ApiException } from '@/domain/exceptions/api-exception'
import { useAuthStore } from '@/presentation/store/auth.store'
import {
  getAdminResourceListUseCase,
  createAdminResourceUseCase,
} from '@/infrastructure/factories/admin-resource.factory'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'
import { formatFlightDateTime, formatPrice } from '@/presentation/utils/formatters'

const CLASE_OPTIONS = [
  { value: 'economica', label: 'Económica' },
  { value: 'ejecutiva', label: 'Ejecutiva' },
  { value: 'primera', label: 'Primera clase' },
]

const schema = z.object({
  numeroAsiento: z.string().min(1, 'Ingresa el/los número(s) de asiento.'),
  pasajerosAdultos: z.string().min(1, 'Ingresa la cantidad de adultos.'),
  pasajerosNinos: z.string().optional(),
  pasajerosBebes: z.string().optional(),
  clase: z.string().min(1, 'Selecciona una clase.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  numeroAsiento: '',
  pasajerosAdultos: '1',
  pasajerosNinos: '0',
  pasajerosBebes: '0',
  clase: 'economica',
}

interface BookFlightDialogProps {
  flight: Flight
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Diálogo de autoreserva para pasajeros: cualquier usuario autenticado puede
 * reservar un vuelo a su propio nombre (el backend valida que el `pasajero`
 * elegido tenga el mismo email que la cuenta — ver ReservaSerializer.validate
 * y permissions.EsPasajeroOOperador). Buscamos el registro de Pasajero del
 * usuario por email; si todavía no existe (perfil incompleto), lo mandamos
 * a completar su perfil en vez de dejarlo adivinar por qué falla.
 */
export function BookFlightDialog({ flight, open, onOpenChange }: BookFlightDialogProps) {
  const user = useAuthStore((state) => state.user)

  const [isCheckingPasajero, setIsCheckingPasajero] = useState(true)
  const [miPasajeroId, setMiPasajeroId] = useState<string | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY })

  useEffect(() => {
    if (!open || !user) return
    let cancelled = false
    setIsCheckingPasajero(true)
    setCheckError(null)
    setSuccess(false)
    setFormError(null)
    form.reset(EMPTY)

    getAdminResourceListUseCase
      .execute('/pasajeros/', { search: user.email, limite: 20 })
      .then((result) => {
        if (cancelled) return
        const match = result.resultados.find(
          (p) => String(p.email ?? '').toLowerCase() === user.email.toLowerCase(),
        )
        setMiPasajeroId(match ? String(match.id) : null)
      })
      .catch((err) => {
        if (cancelled) return
        const apiError = err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.')
        setCheckError(apiError.message)
      })
      .finally(() => {
        if (!cancelled) setIsCheckingPasajero(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.email])

  const handleSubmit = async (values: FormValues) => {
    if (!miPasajeroId) return
    setIsSaving(true)
    setFormError(null)
    try {
      await createAdminResourceUseCase.execute('/reservas/', {
        vuelo: flight.id,
        pasajero: miPasajeroId,
        numero_asiento: values.numeroAsiento,
        pasajeros_adultos: Number(values.pasajerosAdultos),
        pasajeros_ninos: Number(values.pasajerosNinos || 0),
        pasajeros_bebes: Number(values.pasajerosBebes || 0),
        clase: values.clase,
        estado: 'confirmada',
      })
      setSuccess(true)
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException('Ocurrió un error inesperado.')
      setFormError(apiError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reservar {flight.numeroVuelo}</DialogTitle>
        </DialogHeader>

        <p className="-mt-2 text-sm text-muted-foreground">
          {flight.origenCodigo} → {flight.destinoCodigo} · {formatFlightDateTime(flight.salidaProgramada)} ·{' '}
          {formatPrice(flight.precioBase)} por persona (económica)
        </p>

        {isCheckingPasajero && (
          <div className="space-y-2 py-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}

        {!isCheckingPasajero && checkError && (
          <p className="text-sm text-destructive">{checkError}</p>
        )}

        {!isCheckingPasajero && !checkError && !miPasajeroId && (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Para reservar necesitamos tu documento y fecha de nacimiento. Completa esos datos en tu perfil y vuelve
              a intentarlo.
            </p>
            <Button asChild>
              <Link to="/profile">Completar mi perfil</Link>
            </Button>
          </div>
        )}

        {!isCheckingPasajero && !checkError && miPasajeroId && success && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="font-medium">¡Reserva confirmada!</p>
            <p className="text-sm text-muted-foreground">
              Puedes ver el detalle en{' '}
              <Link to="/mis-reservas" className="underline" onClick={() => onOpenChange(false)}>
                Mis reservas
              </Link>
              .
            </p>
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        )}

        {!isCheckingPasajero && !checkError && miPasajeroId && !success && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="numeroAsiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asiento(s) — separados por coma</FormLabel>
                    <FormControl>
                      <Input placeholder="12A,12B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="pasajerosAdultos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adultos</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pasajerosNinos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niños</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pasajerosBebes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bebés</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="clase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clase</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLASE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Reservando...' : 'Confirmar reserva'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
