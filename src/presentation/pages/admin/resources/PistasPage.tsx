// src/presentation/pages/admin/resources/PistasPage.tsx
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

const SUPERFICIE_OPTIONS = [
  { value: 'asfalto', label: 'Asfalto' },
  { value: 'concreto', label: 'Concreto' },
  { value: 'cesped', label: 'Césped' },
  { value: 'grava', label: 'Grava' },
]

const ESTADO_OPTIONS = [
  { value: 'operativa', label: 'Operativa' },
  { value: 'cerrada', label: 'Cerrada' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
]

const schema = z.object({
  aeropuerto: z.string().min(1, 'Selecciona un aeropuerto.'),
  identificador: z.string().min(1, 'El identificador es obligatorio.'),
  longitudMetros: z.string().min(1, 'Ingresa la longitud.'),
  superficie: z.string().min(1, 'Selecciona una superficie.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  aeropuerto: '',
  identificador: '',
  longitudMetros: '2000',
  superficie: 'asfalto',
  estado: 'operativa',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    aeropuerto: String(row.aeropuerto ?? ''),
    identificador: String(row.identificador ?? ''),
    longitudMetros: String(row.longitud_metros ?? '0'),
    superficie: String(row.superficie ?? 'asfalto'),
    estado: String(row.estado ?? 'operativa'),
  }
}

function PistaForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
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
      aeropuerto: values.aeropuerto,
      identificador: values.identificador,
      longitud_metros: Number(values.longitudMetros),
      superficie: values.superficie,
      estado: values.estado,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="aeropuerto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aeropuerto</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un aeropuerto" />
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
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="identificador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificador</FormLabel>
                <FormControl>
                  <Input placeholder="09L/27R" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitudMetros"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud (m)</FormLabel>
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
            name="superficie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Superficie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SUPERFICIE_OPTIONS.map((o) => (
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
  { key: 'identificador', label: 'Identificador' },
  { key: 'aeropuerto_codigo', label: 'Aeropuerto' },
  { key: 'longitud_metros', label: 'Longitud (m)' },
  { key: 'superficie_display', label: 'Superficie' },
  { key: 'estado_display', label: 'Estado' },
]

export default function PistasPage() {
  return (
    <AdminCrudPage
      title="Pistas de Aterrizaje"
      endpoint="/pistas/"
      columns={columns}
      FormComponent={PistaForm}
      itemLabel="pistas"
    />
  )
}
