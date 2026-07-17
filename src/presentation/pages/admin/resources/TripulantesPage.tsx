// src/presentation/pages/admin/resources/TripulantesPage.tsx
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

const ROL_OPTIONS = [
  { value: 'piloto', label: 'Piloto' },
  { value: 'copiloto', label: 'Copiloto' },
  { value: 'auxiliar', label: 'Auxiliar de vuelo' },
  { value: 'jefe_cabina', label: 'Jefe de cabina' },
]

const DISPONIBLE_OPTIONS = [
  { value: 'true', label: 'Disponible' },
  { value: 'false', label: 'No disponible' },
]

const schema = z.object({
  aerolinea: z.string().min(1, 'Selecciona una aerolínea.'),
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().min(1, 'El apellido es obligatorio.'),
  rol: z.string().min(1, 'Selecciona un rol.'),
  numLicencia: z.string().min(1, 'El número de licencia es obligatorio.'),
  disponible: z.string(),
})

type FormValues = z.infer<typeof schema>

const EMPTY: FormValues = {
  aerolinea: '',
  nombre: '',
  apellido: '',
  rol: 'piloto',
  numLicencia: '',
  disponible: 'true',
}

function rowToForm(row: AdminRecord): FormValues {
  return {
    aerolinea: String(row.aerolinea ?? ''),
    nombre: String(row.nombre ?? ''),
    apellido: String(row.apellido ?? ''),
    rol: String(row.rol ?? 'piloto'),
    numLicencia: String(row.num_licencia ?? ''),
    disponible: row.disponible === false ? 'false' : 'true',
  }
}

function TripulanteForm({ initialValues, onSubmit, onCancel, isSaving, error }: AdminFormProps) {
  const { options: aerolineas } = useAdminOptions('/aerolineas/', (r) => `${r.nombre} (${r.codigo_iata})`)

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
      nombre: values.nombre,
      apellido: values.apellido,
      rol: values.rol,
      num_licencia: values.numLicencia,
      disponible: values.disponible === 'true',
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
            name="rol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ROL_OPTIONS.map((o) => (
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
            name="numLicencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° de licencia</FormLabel>
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
          name="disponible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disponibilidad</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DISPONIBLE_OPTIONS.map((o) => (
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
  { key: 'nombre_completo', label: 'Nombre' },
  { key: 'aerolinea_nombre', label: 'Aerolínea' },
  { key: 'rol_display', label: 'Rol' },
  { key: 'num_licencia', label: 'Licencia' },
  { key: 'disponible', label: 'Disponible' },
]

export default function TripulantesPage() {
  return (
    <AdminCrudPage
      title="Tripulantes"
      endpoint="/tripulantes/"
      columns={columns}
      FormComponent={TripulanteForm}
      itemLabel="tripulantes"
    />
  )
}
