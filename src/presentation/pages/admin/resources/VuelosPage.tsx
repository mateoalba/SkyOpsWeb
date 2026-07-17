// src/presentation/pages/admin/resources/VuelosPage.tsx
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

const ESTADO_OPTIONS = [
  { value: 'programado', label: 'Programado' },
  { value: 'embarcando', label: 'Embarcando' },
  { value: 'despegado', label: 'Despegado' },
  { value: 'aterrizado', label: 'Aterrizado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'retrasado', label: 'Retrasado' },
]

function toDatetimeLocal(value: unknown): string {
  const str = String(value ?? '')
  if (!str) return ''
  return str.slice(0, 16)
}

const schema = z.object({
  numeroVuelo: z.string().min(1, 'El número de vuelo es obligatorio.'),
  aerolinea: z.string().min(1, 'Selecciona una aerolínea.'),
  aeronave: z.string().optional(),
  origen: z.string().min(1, 'Selecciona el aeropuerto de origen.'),
  destino: z.string().min(1, 'Selecciona el aeropuerto de destino.'),
  puerta: z.string().optional(),
  salidaProgramada: z.string().min(1, 'Ingresa la salida programada.'),
  llegadaProgramada: z.string().min(1, 'Ingresa la llegada programada.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
  duracionMin: z.string().min(1, 'Ingresa la duración.'),
  precioBase: z.string().min(1, 'Ingresa el precio base.'),
  asientosPrimera: z.string().optional(),
  asientosEjecutiva: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  numeroVuelo: '',
  aerolinea: '',
  aeronave: '',
  origen: '',
  destino: '',
  puerta: '',
  salidaProgramada: '',
  llegadaProgramada: '',
  estado: 'programado',
  duracionMin: '60',
  precioBase: '100',
  asientosPrimera: '0',
  asientosEjecutiva: '0',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    numeroVuelo: String(row.numero_vuelo ?? ''),
    aerolinea: String(row.aerolinea ?? ''),
    aeronave: row.aeronave ? String(row.aeronave) : '',
    origen: String(row.origen ?? ''),
    destino: String(row.destino ?? ''),
    puerta: row.puerta ? String(row.puerta) : '',
    salidaProgramada: toDatetimeLocal(row.salida_programada),
    llegadaProgramada: toDatetimeLocal(row.llegada_programada),
    estado: String(row.estado ?? 'programado'),
    duracionMin: String(row.duracion_min ?? '60'),
    precioBase: String(row.precio_base ?? '100'),
    asientosPrimera: String(row.asientos_primera ?? '0'),
    asientosEjecutiva: String(row.asientos_ejecutiva ?? '0'),
  }
}

function VueloForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: aerolineas } = useAdminOptions('/aerolineas/', (r) => `${r.nombre} (${r.codigo_iata})`)
  const { options: aeronaves } = useAdminOptions('/aeronaves/', (r) => `${r.matricula} - ${r.modelo}`)
  const { options: aeropuertos } = useAdminOptions('/aeropuertos/', (r) => `${r.nombre} (${r.codigo_iata})`)
  const { options: puertas } = useAdminOptions('/puertas/', (r) => `${r.codigo} - ${r.aeropuerto_codigo}`)

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
      numero_vuelo: values.numeroVuelo,
      aerolinea: values.aerolinea,
      aeronave: values.aeronave || null,
      origen: values.origen,
      destino: values.destino,
      puerta: values.puerta || null,
      salida_programada: values.salidaProgramada,
      llegada_programada: values.llegadaProgramada,
      estado: values.estado,
      duracion_min: Number(values.duracionMin),
      precio_base: Number(values.precioBase),
      asientos_primera: Number(values.asientosPrimera || 0),
      asientos_ejecutiva: Number(values.asientosEjecutiva || 0),
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="numeroVuelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="LA1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aerolinea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aerolínea</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aerolineas.map((o) => (
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
            name="origen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origen</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Origen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aeropuertos.map((o) => (
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
            name="destino"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Destino" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aeropuertos.map((o) => (
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
            name="aeronave"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aeronave (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aeronaves.map((o) => (
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
            name="puerta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puerta (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {puertas.map((o) => (
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
            name="salidaProgramada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salida programada</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="llegadaProgramada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Llegada programada</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="duracionMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (min)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
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
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="precioBase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio base</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="asientosPrimera"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asientos 1ª clase</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="asientosEjecutiva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asientos ejecutiva</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
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
  { key: 'numero_vuelo', label: 'N° vuelo' },
  { key: 'aerolinea_nombre', label: 'Aerolínea' },
  { key: 'origen_codigo', label: 'Origen' },
  { key: 'destino_codigo', label: 'Destino' },
  { key: 'salida_programada', label: 'Salida' },
  { key: 'estado_display', label: 'Estado' },
]

export default function VuelosPage() {
  return (
    <AdminCrudPage
      title="Vuelos"
      endpoint="/vuelos/"
      columns={columns}
      FormComponent={VueloForm}
      itemLabel="vuelos"
    />
  )
}
