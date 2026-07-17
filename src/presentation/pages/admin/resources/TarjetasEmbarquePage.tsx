// src/presentation/pages/admin/resources/TarjetasEmbarquePage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { useAdminOptions } from '@/presentation/hooks/use-admin-options'
import { AdminCrudPage, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const ESTADO_OPTIONS = [
  { value: 'generada', label: 'Generada' },
  { value: 'usada', label: 'Usada — pasajero abordó' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'expirada', label: 'Expirada' },
]

function toDatetimeLocal(value: unknown): string {
  const str = String(value ?? '')
  if (!str) return ''
  return str.slice(0, 16)
}

const schema = z.object({
  reserva: z.string().min(1, 'Selecciona una reserva.'),
  asiento: z.string().min(1, 'El asiento es obligatorio.'),
  puertaEmbarque: z.string().min(1, 'La puerta de embarque es obligatoria.'),
  grupoEmbarque: z.string().optional(),
  horaLimiteEmbarque: z.string().min(1, 'Ingresa la hora límite de embarque.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
  checkInOnline: z.string(),
  observaciones: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  reserva: '',
  asiento: '',
  puertaEmbarque: '',
  grupoEmbarque: '',
  horaLimiteEmbarque: '',
  estado: 'generada',
  checkInOnline: 'false',
  observaciones: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    reserva: String(row.reserva ?? ''),
    asiento: String(row.asiento ?? ''),
    puertaEmbarque: String(row.puerta_embarque ?? ''),
    grupoEmbarque: String(row.grupo_embarque ?? ''),
    horaLimiteEmbarque: toDatetimeLocal(row.hora_limite_embarque),
    estado: String(row.estado ?? 'generada'),
    checkInOnline: row.check_in_online === true ? 'true' : 'false',
    observaciones: String(row.observaciones ?? ''),
  }
}

function TarjetaEmbarqueForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: reservas } = useAdminOptions('/reservas/', (r) => `${r.codigo_reserva} - ${r.pasajero_nombre}`)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ? rowToForm(initialValues) : EMPTY,
  })

  useEffect(() => {
    form.reset(initialValues ? rowToForm(initialValues) : EMPTY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      reserva: values.reserva,
      asiento: values.asiento,
      puerta_embarque: values.puertaEmbarque,
      grupo_embarque: values.grupoEmbarque,
      hora_limite_embarque: values.horaLimiteEmbarque,
      estado: values.estado,
      check_in_online: values.checkInOnline === 'true',
      observaciones: values.observaciones,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reserva"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reserva</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una reserva" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {reservas.map((o) => (
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
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="asiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asiento</FormLabel>
                <FormControl>
                  <Input placeholder="14A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="puertaEmbarque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puerta</FormLabel>
                <FormControl>
                  <Input placeholder="G12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grupoEmbarque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo</FormLabel>
                <FormControl>
                  <Input placeholder="A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="horaLimiteEmbarque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora límite de embarque</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ESTADO_OPTIONS.map((o) => (
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
        </div>
        <FormField
          control={form.control}
          name="checkInOnline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-in online</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

const columns: AdminColumn[] = [
  { key: 'pasajero_nombre', label: 'Pasajero' },
  { key: 'vuelo_numero', label: 'Vuelo' },
  { key: 'asiento', label: 'Asiento' },
  { key: 'puerta_embarque', label: 'Puerta' },
  { key: 'estado_display', label: 'Estado' },
]

export default function TarjetasEmbarquePage() {
  return (
    <AdminCrudPage
      title="Tarjetas de Embarque"
      endpoint="/tarjetas-embarque/"
      columns={columns}
      FormComponent={TarjetaEmbarqueForm}
      itemLabel="tarjetas"
    />
  )
}
