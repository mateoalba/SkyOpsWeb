// src/presentation/pages/admin/resources/PasajerosPage.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { AdminRecord } from '@/domain/ports/admin-resource-repository.port'
import { AdminCrudPage, type AdminColumn, type AdminFormProps } from '@/presentation/pages/admin/AdminCrudPage'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/components/ui/form'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().min(1, 'El apellido es obligatorio.'),
  numPasaporte: z.string().min(1, 'El número de pasaporte es obligatorio.'),
  nacionalidad: z.string().min(1, 'La nacionalidad es obligatoria.'),
  fechaNacimiento: z.string().min(1, 'Ingresa la fecha de nacimiento.'),
  email: z.string().email('Ingresa un email válido.'),
  telefono: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  nombre: '',
  apellido: '',
  numPasaporte: '',
  nacionalidad: '',
  fechaNacimiento: '',
  email: '',
  telefono: '',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    nombre: String(row.nombre ?? ''),
    apellido: String(row.apellido ?? ''),
    numPasaporte: String(row.num_pasaporte ?? ''),
    nacionalidad: String(row.nacionalidad ?? ''),
    fechaNacimiento: String(row.fecha_nacimiento ?? ''),
    email: String(row.email ?? ''),
    telefono: String(row.telefono ?? ''),
  }
}

function PasajeroForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
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
      nombre: values.nombre,
      apellido: values.apellido,
      num_pasaporte: values.numPasaporte,
      nacionalidad: values.nacionalidad,
      fecha_nacimiento: values.fechaNacimiento,
      email: values.email,
      telefono: values.telefono,
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
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
            name="numPasaporte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° de pasaporte</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nacionalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidad</FormLabel>
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
            name="fechaNacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
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
  { key: 'nombre_completo', label: 'Nombre' },
  { key: 'num_pasaporte', label: 'Pasaporte' },
  { key: 'nacionalidad', label: 'Nacionalidad' },
  { key: 'email', label: 'Email' },
  { key: 'total_reservas', label: 'Reservas' },
]

export default function PasajerosPage() {
  return (
    <AdminCrudPage
      title="Pasajeros"
      endpoint="/pasajeros/"
      columns={columns}
      FormComponent={PasajeroForm}
      itemLabel="pasajeros"
    />
  )
}
