// src/presentation/pages/admin/resources/ReservasPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { useAdminOptions } from '@/presentation/hooks/use-admin-options'
import { AdminCrudPage, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const CLASE_OPTIONS = [
  { value: 'economica', label: 'Económica' },
  { value: 'ejecutiva', label: 'Ejecutiva' },
  { value: 'primera', label: 'Primera clase' },
]

const ESTADO_OPTIONS = [
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'abordada', label: 'Abordada' },
]

const schema = z.object({
  vuelo: z.string().min(1, 'Selecciona un vuelo.'),
  pasajero: z.string().min(1, 'Selecciona un pasajero.'),
  numeroAsiento: z.string().min(1, 'Ingresa el/los número(s) de asiento.'),
  pasajerosAdultos: z.string().min(1, 'Ingresa la cantidad de adultos.'),
  pasajerosNinos: z.string().optional(),
  pasajerosBebes: z.string().optional(),
  clase: z.string().min(1, 'Selecciona una clase.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  vuelo: '',
  pasajero: '',
  numeroAsiento: '',
  pasajerosAdultos: '1',
  pasajerosNinos: '0',
  pasajerosBebes: '0',
  clase: 'economica',
  estado: 'pendiente',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    vuelo: String(row.vuelo ?? ''),
    pasajero: String(row.pasajero ?? ''),
    numeroAsiento: String(row.numero_asiento ?? ''),
    pasajerosAdultos: String(row.pasajeros_adultos ?? '1'),
    pasajerosNinos: String(row.pasajeros_ninos ?? '0'),
    pasajerosBebes: String(row.pasajeros_bebes ?? '0'),
    clase: String(row.clase ?? 'economica'),
    estado: String(row.estado ?? 'pendiente'),
  }
}

function ReservaForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: vuelos } = useAdminOptions(
    '/vuelos/',
    (r) => `${r.numero_vuelo} (${r.origen_codigo}→${r.destino_codigo})`,
  )
  const { options: pasajeros } = useAdminOptions('/pasajeros/', (r) => `${r.nombre_completo} (${r.num_pasaporte})`)

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
      vuelo: values.vuelo,
      pasajero: values.pasajero,
      numero_asiento: values.numeroAsiento,
      pasajeros_adultos: Number(values.pasajerosAdultos),
      pasajeros_ninos: Number(values.pasajerosNinos || 0),
      pasajeros_bebes: Number(values.pasajerosBebes || 0),
      clase: values.clase,
      estado: values.estado,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="vuelo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vuelo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vuelo" />
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
        <div className="grid grid-cols-2 gap-3">
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
  { key: 'codigo_reserva', label: 'Código' },
  { key: 'vuelo_numero', label: 'Vuelo' },
  { key: 'pasajero_nombre', label: 'Pasajero' },
  { key: 'clase_display', label: 'Clase' },
  { key: 'estado_display', label: 'Estado' },
  { key: 'precio', label: 'Precio' },
]

export default function ReservasPage() {
  return (
    <AdminCrudPage
      title="Reservas"
      endpoint="/reservas/"
      columns={columns}
      FormComponent={ReservaForm}
      itemLabel="reservas"
    />
  )
}
