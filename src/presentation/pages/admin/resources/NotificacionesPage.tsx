// src/presentation/pages/admin/resources/NotificacionesPage.tsx
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

const TIPO_OPTIONS = [
  { value: 'retraso', label: 'Retraso de vuelo' },
  { value: 'cancelacion', label: 'Cancelación de vuelo' },
  { value: 'cambio_puerta', label: 'Cambio de puerta' },
  { value: 'embarque', label: 'Llamado a embarque' },
  { value: 'confirmacion', label: 'Confirmación de reserva' },
  { value: 'recordatorio', label: 'Recordatorio de vuelo' },
  { value: 'equipaje', label: 'Estado de equipaje' },
  { value: 'otro', label: 'Otro' },
]

const CANAL_OPTIONS = [
  { value: 'email', label: 'Correo electrónico' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Notificación push' },
  { value: 'sistema', label: 'Sistema interno' },
]

const ESTADO_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente de envío' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'leida', label: 'Leída' },
  { value: 'fallida', label: 'Fallo en el envío' },
]

function toDatetimeLocal(value: unknown): string {
  const str = String(value ?? '')
  if (!str) return ''
  return str.slice(0, 16)
}

const schema = z.object({
  pasajero: z.string().min(1, 'Selecciona un pasajero.'),
  vuelo: z.string().optional(),
  tipo: z.string().min(1, 'Selecciona un tipo.'),
  canal: z.string().min(1, 'Selecciona un canal.'),
  asunto: z.string().min(1, 'El asunto es obligatorio.'),
  mensaje: z.string().min(1, 'El mensaje es obligatorio.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
  fechaEnvio: z.string().optional(),
  fechaLectura: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  pasajero: '',
  vuelo: '',
  tipo: 'otro',
  canal: 'email',
  asunto: '',
  mensaje: '',
  estado: 'pendiente',
  fechaEnvio: '',
  fechaLectura: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    pasajero: String(row.pasajero ?? ''),
    vuelo: row.vuelo ? String(row.vuelo) : '',
    tipo: String(row.tipo ?? 'otro'),
    canal: String(row.canal ?? 'email'),
    asunto: String(row.asunto ?? ''),
    mensaje: String(row.mensaje ?? ''),
    estado: String(row.estado ?? 'pendiente'),
    fechaEnvio: toDatetimeLocal(row.fecha_envio),
    fechaLectura: toDatetimeLocal(row.fecha_lectura),
  }
}

function NotificacionForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: pasajeros } = useAdminOptions('/pasajeros/', (r) => `${r.nombre_completo} (${r.num_pasaporte})`)
  const { options: vuelos } = useAdminOptions(
    '/vuelos/',
    (r) => `${r.numero_vuelo} (${r.origen_codigo}→${r.destino_codigo})`,
  )

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
      pasajero: values.pasajero,
      vuelo: values.vuelo || null,
      tipo: values.tipo,
      canal: values.canal,
      asunto: values.asunto,
      mensaje: values.mensaje,
      estado: values.estado,
      fecha_envio: values.fechaEnvio || null,
      fecha_lectura: values.fechaLectura || null,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="pasajero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pasajero</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un pasajero" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pasajeros.map((o) => (
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
          <FormField
            control={form.control}
            name="vuelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vuelo (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin vuelo asociado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vuelos.map((o) => (
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
          name="asunto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asunto</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mensaje"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPO_OPTIONS.map((o) => (
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
          <FormField
            control={form.control}
            name="canal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CANAL_OPTIONS.map((o) => (
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
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fechaEnvio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de envío (opcional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaLectura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de lectura (opcional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
  { key: 'tipo_display', label: 'Tipo' },
  { key: 'canal_display', label: 'Canal' },
  { key: 'estado_display', label: 'Estado' },
  { key: 'creada_en', label: 'Creada' },
]

export default function NotificacionesPage() {
  return (
    <AdminCrudPage
      title="Notificaciones"
      endpoint="/notificaciones/"
      columns={columns}
      FormComponent={NotificacionForm}
      itemLabel="notificaciones"
    />
  )
}
