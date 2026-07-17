// src/presentation/pages/admin/resources/HorariosPage.tsx
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
import { cn } from '@/presentation/utils/cn'

const DIAS_OPTIONS = [
  { value: 'lunes', label: 'Lun' },
  { value: 'martes', label: 'Mar' },
  { value: 'miercoles', label: 'Mié' },
  { value: 'jueves', label: 'Jue' },
  { value: 'viernes', label: 'Vie' },
  { value: 'sabado', label: 'Sáb' },
  { value: 'domingo', label: 'Dom' },
]

const ACTIVO_OPTIONS = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
]

const schema = z.object({
  aerolinea: z.string().min(1, 'Selecciona una aerolínea.'),
  origen: z.string().min(1, 'Selecciona el aeropuerto de origen.'),
  destino: z.string().min(1, 'Selecciona el aeropuerto de destino.'),
  numeroVueloBase: z.string().min(1, 'Ingresa el número de vuelo base.'),
  horaSalida: z.string().min(1, 'Ingresa la hora de salida.'),
  diasOperacion: z.array(z.string()).min(1, 'Selecciona al menos un día.'),
  activo: z.string(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  aerolinea: '',
  origen: '',
  destino: '',
  numeroVueloBase: '',
  horaSalida: '',
  diasOperacion: [],
  activo: 'true',
}

function rowToForm(row: AdminRecord): FormValues {
  const dias = Array.isArray(row.dias_operacion) ? (row.dias_operacion as unknown[]).map(String) : []
  return {
    aerolinea: String(row.aerolinea ?? ''),
    origen: String(row.origen ?? ''),
    destino: String(row.destino ?? ''),
    numeroVueloBase: String(row.numero_vuelo_base ?? ''),
    horaSalida: String(row.hora_salida ?? '').slice(0, 5),
    diasOperacion: dias,
    activo: row.activo === false ? 'false' : 'true',
  }
}

function HorarioForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: aerolineas } = useAdminOptions('/aerolineas/', (r) => `${r.nombre} (${r.codigo_iata})`)
  const { options: aeropuertos } = useAdminOptions('/aeropuertos/', (r) => `${r.nombre} (${r.codigo_iata})`)

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
      aerolinea: values.aerolinea,
      origen: values.origen,
      destino: values.destino,
      numero_vuelo_base: values.numeroVueloBase,
      hora_salida: values.horaSalida,
      dias_operacion: values.diasOperacion,
      activo: values.activo === 'true',
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="aerolinea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aerolínea</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una aerolínea" />
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
            name="numeroVueloBase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de vuelo base</FormLabel>
                <FormControl>
                  <Input placeholder="LA1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horaSalida"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de salida</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="diasOperacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Días de operación</FormLabel>
              <div className="flex flex-wrap gap-2">
                {DIAS_OPTIONS.map((dia) => {
                  const selected = field.value.includes(dia.value)
                  return (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((v: string) => v !== dia.value)
                            : [...field.value, dia.value],
                        )
                      }
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm',
                        selected ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
                      )}
                    >
                      {dia.label}
                    </button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activo"
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
                  {ACTIVO_OPTIONS.map((o) => (
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
  { key: 'numero_vuelo_base', label: 'N° base' },
  { key: 'aerolinea_nombre', label: 'Aerolínea' },
  { key: 'origen_codigo', label: 'Origen' },
  { key: 'destino_codigo', label: 'Destino' },
  { key: 'hora_salida', label: 'Hora salida' },
  { key: 'activo', label: 'Activo' },
]

export default function HorariosPage() {
  return (
    <AdminCrudPage
      title="Horarios de Vuelo"
      endpoint="/horarios/"
      columns={columns}
      FormComponent={HorarioForm}
      itemLabel="horarios"
    />
  )
}
