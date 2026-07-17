// src/presentation/pages/admin/resources/TerminalesPage.tsx
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
  { value: 'activa', label: 'Activa' },
  { value: 'inactiva', label: 'Inactiva' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
]

const schema = z.object({
  aeropuerto: z.string().min(1, 'Selecciona un aeropuerto.'),
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  codigo: z.string().min(1, 'El código es obligatorio.'),
  capacidadPuertas: z.string().min(1, 'Ingresa la capacidad.'),
  estado: z.string().min(1, 'Selecciona un estado.'),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = { aeropuerto: '', nombre: '', codigo: '', capacidadPuertas: '0', estado: 'activa' }

function rowToForm(row: AdminRecord): FormValues {
  return {
    aeropuerto: String(row.aeropuerto ?? ''),
    nombre: String(row.nombre ?? ''),
    codigo: String(row.codigo ?? ''),
    capacidadPuertas: String(row.capacidad_puertas ?? '0'),
    estado: String(row.estado ?? 'activa'),
  }
}

function TerminalForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: aeropuertos } = useAdminOptions(
    '/aeropuertos/',
    (r) => `${r.nombre} (${r.codigo_iata})`,
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
      aeropuerto: values.aeropuerto,
      nombre: values.nombre,
      codigo: values.codigo,
      capacidad_puertas: Number(values.capacidadPuertas),
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
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="capacidadPuertas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad de puertas</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
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
  { key: 'codigo', label: 'Código' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'aeropuerto_codigo', label: 'Aeropuerto' },
  { key: 'capacidad_puertas', label: 'Puertas' },
  { key: 'estado_display', label: 'Estado' },
]

export default function TerminalesPage() {
  return (
    <AdminCrudPage
      title="Terminales"
      endpoint="/terminales/"
      columns={columns}
      FormComponent={TerminalForm}
      itemLabel="terminales"
    />
  )
}
