// src/presentation/pages/admin/resources/MantenimientosPage.tsx
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
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'revision_a', label: 'Revisión A' },
  { value: 'revision_b', label: 'Revisión B' },
  { value: 'revision_c', label: 'Revisión C' },
  { value: 'emergencia', label: 'Emergencia' },
]

const ESTADO_OPTIONS = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'postergado', label: 'Postergado' },
]

function toDatetimeLocal(value: unknown): string {
  const str = String(value ?? '')
  if (!str) return ''
  return str.slice(0, 16)
}

const schema = z.object({
  aeronave: z.string().min(1, 'Selecciona una aeronave.'),
  aeropuerto: z.string().optional(),
  tipo: z.string().min(1, 'Selecciona un tipo.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
  descripcion: z.string().min(1, 'La descripción es obligatoria.'),
  tecnicoResponsable: z.string().min(1, 'Ingresa el técnico responsable.'),
  fechaInicio: z.string().min(1, 'Ingresa la fecha de inicio.'),
  fechaFinEstimada: z.string().min(1, 'Ingresa la fecha de fin estimada.'),
  fechaFinReal: z.string().optional(),
  costoEstimado: z.string().optional(),
  costoReal: z.string().optional(),
  horasFueraServicio: z.string().optional(),
  observaciones: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  aeronave: '',
  aeropuerto: '',
  tipo: 'preventivo',
  estado: 'programado',
  descripcion: '',
  tecnicoResponsable: '',
  fechaInicio: '',
  fechaFinEstimada: '',
  fechaFinReal: '',
  costoEstimado: '',
  costoReal: '',
  horasFueraServicio: '',
  observaciones: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    aeronave: String(row.aeronave ?? ''),
    aeropuerto: row.aeropuerto ? String(row.aeropuerto) : '',
    tipo: String(row.tipo ?? 'preventivo'),
    estado: String(row.estado ?? 'programado'),
    descripcion: String(row.descripcion ?? ''),
    tecnicoResponsable: String(row.tecnico_responsable ?? ''),
    fechaInicio: toDatetimeLocal(row.fecha_inicio),
    fechaFinEstimada: toDatetimeLocal(row.fecha_fin_estimada),
    fechaFinReal: toDatetimeLocal(row.fecha_fin_real),
    costoEstimado: row.costo_estimado !== null && row.costo_estimado !== undefined ? String(row.costo_estimado) : '',
    costoReal: row.costo_real !== null && row.costo_real !== undefined ? String(row.costo_real) : '',
    horasFueraServicio:
      row.horas_fuera_servicio !== null && row.horas_fuera_servicio !== undefined
        ? String(row.horas_fuera_servicio)
        : '',
    observaciones: String(row.observaciones ?? ''),
  }
}

function MantenimientoForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: aeronaves } = useAdminOptions('/aeronaves/', (r) => `${r.matricula} - ${r.modelo}`)
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
      aeronave: values.aeronave,
      aeropuerto: values.aeropuerto || null,
      tipo: values.tipo,
      estado: values.estado,
      descripcion: values.descripcion,
      tecnico_responsable: values.tecnicoResponsable,
      fecha_inicio: values.fechaInicio,
      fecha_fin_estimada: values.fechaFinEstimada,
      fecha_fin_real: values.fechaFinReal || null,
      costo_estimado: values.costoEstimado ? Number(values.costoEstimado) : null,
      costo_real: values.costoReal ? Number(values.costoReal) : null,
      horas_fuera_servicio: values.horasFueraServicio ? Number(values.horasFueraServicio) : null,
      observaciones: values.observaciones,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="aeronave"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aeronave</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una aeronave" />
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
            name="aeropuerto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aeropuerto (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
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
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
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
          name="tecnicoResponsable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Técnico responsable</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de inicio</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaFinEstimada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de fin estimada</FormLabel>
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
            name="fechaFinReal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de fin real (opcional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horasFueraServicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas fuera de servicio (opcional)</FormLabel>
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
            name="costoEstimado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo estimado (opcional)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costoReal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo real (opcional)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
  { key: 'aeronave_matricula', label: 'Aeronave' },
  { key: 'tipo_display', label: 'Tipo' },
  { key: 'estado_display', label: 'Estado' },
  { key: 'tecnico_responsable', label: 'Técnico' },
  { key: 'fecha_inicio', label: 'Inicio' },
]

export default function MantenimientosPage() {
  return (
    <AdminCrudPage
      title="Mantenimientos"
      endpoint="/mantenimientos/"
      columns={columns}
      FormComponent={MantenimientoForm}
      itemLabel="mantenimientos"
    />
  )
}
