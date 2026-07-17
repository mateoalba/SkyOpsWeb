// src/presentation/pages/admin/resources/AsignacionesTripulacionPage.tsx
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

const schema = z.object({
  vuelo: z.string().min(1, 'Selecciona un vuelo.'),
  tripulante: z.string().min(1, 'Selecciona un tripulante.'),
  rolAsignado: z.string().min(1, 'Ingresa el rol asignado.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = { vuelo: '', tripulante: '', rolAsignado: '' }

function rowToForm(row: AdminRecord): FormValues {
  return {
    vuelo: String(row.vuelo ?? ''),
    tripulante: String(row.tripulante ?? ''),
    rolAsignado: String(row.rol_asignado ?? ''),
  }
}

function AsignacionTripulacionForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: vuelos } = useAdminOptions(
    '/vuelos/',
    (r) => `${r.numero_vuelo} (${r.origen_codigo}→${r.destino_codigo})`,
  )
  const { options: tripulantes } = useAdminOptions('/tripulantes/', (r) => `${r.nombre_completo} (${r.rol_display})`)

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
      tripulante: values.tripulante,
      rol_asignado: values.rolAsignado,
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
          name="tripulante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tripulante</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tripulante" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tripulantes.map((o) => (
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
          name="rolAsignado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol asignado en este vuelo</FormLabel>
              <FormControl>
                <Input placeholder="Piloto al mando" {...field} />
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
  { key: 'vuelo_numero', label: 'Vuelo' },
  { key: 'tripulante_nombre', label: 'Tripulante' },
  { key: 'tripulante_rol', label: 'Rol base' },
  { key: 'rol_asignado', label: 'Rol asignado' },
]

export default function AsignacionesTripulacionPage() {
  return (
    <AdminCrudPage
      title="Asignaciones de Tripulación"
      endpoint="/asignaciones/"
      columns={columns}
      FormComponent={AsignacionTripulacionForm}
      itemLabel="asignaciones"
    />
  )
}
