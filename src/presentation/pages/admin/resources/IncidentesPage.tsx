// src/presentation/pages/admin/resources/IncidentesPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { useAdminOptions } from '@/presentation/hooks/use-admin-options'
import { AdminCrudPage, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
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
  { value: 'tecnico', label: 'Técnico' },
  { value: 'medico', label: 'Médico' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'meteorologico', label: 'Meteorológico' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'otro', label: 'Otro' },
]

const SEVERIDAD_OPTIONS = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
]

const ESTADO_OPTIONS = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelto', label: 'Resuelto' },
]

const schema = z.object({
  vuelo: z.string().min(1, 'Selecciona un vuelo.'),
  tipo: z.string().min(1, 'Selecciona un tipo.'),
  descripcion: z.string().min(1, 'La descripción es obligatoria.'),
  severidad: z.string().min(1, 'Selecciona una severidad.'),
  estadoResolucion: z.string().min(1, 'Selecciona un estado.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  vuelo: '',
  tipo: 'tecnico',
  descripcion: '',
  severidad: 'media',
  estadoResolucion: 'abierto',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    vuelo: String(row.vuelo ?? ''),
    tipo: String(row.tipo ?? 'tecnico'),
    descripcion: String(row.descripcion ?? ''),
    severidad: String(row.severidad ?? 'media'),
    estadoResolucion: String(row.estado_resolucion ?? 'abierto'),
  }
}

function IncidenteForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
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
      vuelo: values.vuelo,
      tipo: values.tipo,
      descripcion: values.descripcion,
      severidad: values.severidad,
      estado_resolucion: values.estadoResolucion,
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
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
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
            name="severidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SEVERIDAD_OPTIONS.map((o) => (
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
            name="estadoResolucion"
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
  { key: 'vuelo_numero', label: 'Vuelo' },
  { key: 'tipo_display', label: 'Tipo' },
  { key: 'severidad_display', label: 'Severidad' },
  { key: 'estado_resolucion_display', label: 'Estado' },
  { key: 'reportado_en', label: 'Reportado' },
]

export default function IncidentesPage() {
  return (
    <AdminCrudPage
      title="Incidentes"
      endpoint="/incidentes/"
      columns={columns}
      FormComponent={IncidenteForm}
      itemLabel="incidentes"
    />
  )
}
